var SliderVue = Vue.extend({
  data: function () {
    var params = location.search.substring(1).split('&').map(function (exp) {
      var match = exp.match('^(.+?)=(.*)$')

      if (!match)
        return null

      return { 
        key: match[1],
        value: match[2]
      }
    })

    var channelId = params.filter(function (param) {
      if (!param)
        return false
      return param.key === 'channel_id'
    })[0]

    var campaignId = params.filter(function (param) {
      if (!param)
        return false
      return param.key === 'campaign_id'
    })[0]

    if (channelId)
      window.localStorage['channel_id'] = channelId.value
    if (campaignId)
      window.localStorage['campaign_id'] = campaignId.value

    return {
      scrollTop: 0,
      height: 0,
      v: 0,
      count: 0,
      channelId: window.localStorage['channel_id'],
      campaignId: window.localStorage['campaign_id']
    }
  },
  ready: function () {
    var vue = this
    var el = vue.$el

    kDrag.bind(el)

    el.addEventListener('touchstart', function () {
      vue.onTouchstart()
    })
    el.addEventListener('k.drag', function (e) {
      vue.onDrag(e)
    })
    el.addEventListener('k.dragend', function (e) {
      vue.onDragend(e)
    })
    el.addEventListener('touchend', function () {
      vue.onTouchend()
    })

    vue.resize()

    window.addEventListener('resize', function () {
      vue.resize()
    })

    vue.$broadcast('scrollByIndex', vue.current, 0)
  },
  computed: {
    current: {
      get: function () {
        var value = Math.floor(this.scrollTop / this.height) + 1 || 1

        if (value < 1)
          value = 1
        else if (value > this.count)
          value = this.count

        return value
      },
      set: function (value) {
        if (!value)
          return
        this.scrollTop = this.height * (value - 1)
      }
    },
    maxScroll: function () {
      return this.height * (this.count - 1)
    }
  },
  replace: true,
  events: {
    sectionCreated: function () {
      this.count++
    }
  },
  methods: {
    onTouchstart: function () {
      var vue = this
      vue.v = 0
      vue.$broadcast('stopAnimation')
    },
    onDrag: function (e) {
      var vue = this

      var stepY = e.stepY

      if (vue.scrollTop > vue.maxScroll && stepY < 0)
        stepY = stepY / (vue.scrollTop - stepY - vue.maxScroll) * 10
      else if (vue.scrollTop < 0 && stepY > 0)
        stepY = stepY / -(vue.scrollTop - stepY) * 10

      vue.scrollTop -= stepY
    },
    onDragend: function (e) {
      this.v = e.vy
    },
    onTouchend: function () {
      var v = this.v
      var absV = Math.abs(v)

      var duration

      if (Math.abs(absV) > 0.382) {
        duration = Math.max(400 / absV, 260)
        if (v > 0)
          this.$broadcast('scrollByIndex', this.current, duration)
        else
          this.$broadcast('scrollByIndex', this.current + 1, duration)
      } else {
        duration = 400
        if (this.scrollTop - this.height * (this.current - 1) > this.height / 2) {
          this.$broadcast('scrollByIndex', this.current + 1, duration)
        } else {
          this.$broadcast('scrollByIndex', this.current, duration)
        }
      }
    },
    resize: function () {
      var current = this.current
      this.height = this.$el.clientHeight
      this.scrollTop = this.height * (current - 1)
    }
  }
})

var SectionVue = Vue.extend({
  replace: true,
  inherit: true,
  paramAttributes: ['index'],
  created: function () {
    this.$dispatch('sectionCreated')
  },
  compiled: function () {
    this.index = parseFloat(this.index)
  },
  ready: function () {
    if (document.documentElement.style.perspective !== undefined)
      Velocity.hook(this.$el, 'translateZ', '.000001px')
  },
  watch: {
    scrollTop: function (value) {
      var vue = this
      var el = vue.$el

      var style = vue.computeStyle(value)

      if (!style)
        return

      vue.setStyle(style)
    }
  },
  events: {
    scrollByIndex: function (index, duration) {
      if (duration === undefined)
        duration = 400

      var vue = this

      if (index > vue.count)
        index = vue.count
      else if (index < 1)
        index = 1

      var el = vue.$el

      var scrollTop = vue.height * (index - 1)

      var style = vue.computeStyle(scrollTop)

      if (!style)
        return

      vue.$emit('stopAnimation')

      if (duration === 0) {
        vue.setStyle(style)
        vue.scrollTop = scrollTop
      } else {
        Velocity(el, style, {
          duration: duration,
          easing: 'ease-out',
          complete: function () {
            vue.scrollTop = scrollTop
          }
        })
      }
    },
    stopAnimation: function () {
      var vue = this
      var el = vue.$el
      Velocity(el, 'stop')

      if (this.index === this.current)
        this.scrollTop = this.height * (this.current - 1) - parseFloat(Velocity.hook(el, 'translateY'))
    }
  },
  methods: {
    computeStyle: function (scrollTop) {
      var vue = this
      var el = vue.$el

      var sectionTranslateY = vue.height * (vue.current - 1) - scrollTop

      if (vue.index === vue.current) {
        return {
          translateY: sectionTranslateY + 'px'
        }
      }
      else if (vue.index === vue.current - 1) {
        return {
          translateY: (sectionTranslateY - vue.height - sectionTranslateY / 1.618) + 'px'
        }
      }
      else if (vue.index === vue.current + 1) {
        return {
          translateY: (sectionTranslateY + vue.height - (sectionTranslateY + vue.height) / 1.618) + 'px'
        }
      } else {
        return {
          translateY: -vue.height * 1.1 + 'px'
        }
      }
    },
    setStyle: function (style) {
      var vue = this
      var el = vue.$el

      for (var name in style) {
        Velocity.hook(el, name, style[name])
      }
    }
  }
})

var SectionMenuVue = SectionVue.extend({
  template: '#template_menu',
  data: function () {
    return {
      showQRCode: false,
      isWechat: navigator.userAgent.indexOf('MicroMessenger') >= 0
    }
  },
  methods: {
    open: function (name) {
      this.$dispatch('open', name)
    },
    stopPropagation: function (e) {
      e.stopPropagation()
    }
  }
})

var HomeSliderVue = SliderVue.extend({
  template: '#template_home',
  ready: function () {
    var vue = this
    var el = vue.$el

    setTimeout(function () {
      vue.$broadcast('unlock')
    }, 4000)

    if (window.location.hash === '#menu') {
      vue.$broadcast('unlock')
      vue.$broadcast('scrollByIndex', 2, 0)
    } else {
      setTimeout(function () {
        vue.$broadcast('unlock')
      }, 4000)
    }

  },
  components: {
    cover: SectionVue.extend({
      template: '#template_cover',
      ready: function () {
        var vue = this
        var el = vue.$el

        el.addEventListener('touchstart', vue.preventTouch)
      },
      events: {
        unlock: function () {
          this.$el.removeEventListener('touchstart', this.preventTouch)
        }
      },
      methods: {
        preventTouch: function (e) {
          e.stopPropagation()
          e.preventDefault()
        }
      },
      watch: {
        current: function (value) {
          if (value === this.index)
            window.location.hash = '#cover'
        }
      }
    }),
    menu: SectionMenuVue.extend({
      ready: function () {
        this.$el.style.display = 'none'
      },
      events: {
        unlock: function () {
          this.$el.style.display = 'block'
        }
      },
      watch: {
        current: function (value) {
          if (value === this.index)
            window.location.hash = '#menu'
        }
      }
    })
  }
})

var AppSectionVue = SectionVue.extend({
  components: {
    'btn-return': {
      template: '#template_section_button_return',
      replace: true,
      methods: {
        returnToHome: function () {
          this.$dispatch('open', 'index')
        }
      }
    }
  }
})

var HardCoverSectionVue = AppSectionVue.extend({
  components: {
    stamp: {
      template: '#template_hard_cover_stamp',
      replace: true
    }
  }
})

var HardCoverSliderVue = SliderVue.extend({
  template: '#template_hard_cover',
  components: {
    section1: HardCoverSectionVue.extend({
      template: '#template_hard_cover_section_1'
    }),
    section2: HardCoverSectionVue.extend({
      template: '#template_hard_cover_section_2'
    }),
    section3: HardCoverSectionVue.extend({
      template: '#template_hard_cover_section_3'
    }),
    section4: HardCoverSectionVue.extend({
      template: '#template_hard_cover_section_4'
    }),
    section5: HardCoverSectionVue.extend({
      template: '#template_hard_cover_section_5'
    }),
    section6: HardCoverSectionVue.extend({
      template: '#template_hard_cover_section_6'
    }),
    section7: HardCoverSectionVue.extend({
      template: '#template_hard_cover_section_7'
    }),
    section8: HardCoverSectionVue.extend({
      template: '#template_hard_cover_section_8'
    }),
    menu: SectionMenuVue
  }
})

var SoftCoverSectionVue = AppSectionVue.extend({
  components: {
    stamp: {
      template: '#template_soft_cover_stamp',
      replace: true
    }
  }
})

var SoftCoverSliderVue = SliderVue.extend({
  template: '#template_soft_cover',
  components: {
    section1: SoftCoverSectionVue.extend({
      template: '#template_soft_cover_section_1'
    }),
    section2: SoftCoverSectionVue.extend({
      template: '#template_soft_cover_section_2'
    }),
    section3: SoftCoverSectionVue.extend({
      template: '#template_soft_cover_section_3'
    }),
    section4: SoftCoverSectionVue.extend({
      template: '#template_soft_cover_section_4'
    }),
    section5: SoftCoverSectionVue.extend({
      template: '#template_soft_cover_section_5'
    }),
    section6: SoftCoverSectionVue.extend({
      template: '#template_soft_cover_section_6'
    }),
    section7: SoftCoverSectionVue.extend({
      template: '#template_soft_cover_section_7'
    }),
    menu: SectionMenuVue
  }
})

var MakeStepSectionVue = AppSectionVue.extend({
  components: {
    stamp: {
      template: '#template_make_step_stamp',
      replace: true
    }
  }
})

var MakeStepSliderVue = SliderVue.extend({
  template: '#template_make_step',
  components: {
    section1: MakeStepSectionVue.extend({
      template: '#template_make_step_section_1'
    }),
    section2: MakeStepSectionVue.extend({
      template: '#template_make_step_section_2'
    }),
    section3: MakeStepSectionVue.extend({
      template: '#template_make_step_section_3'
    }),
    section4: MakeStepSectionVue.extend({
      template: '#template_make_step_section_4'
    }),
    menu: SectionMenuVue
  }
})

var PriceSectionVue = AppSectionVue.extend({
  components: {
    stamp: {
      template: '#template_price_stamp',
      replace: true
    }
  }
})

var PriceSliderVue = SliderVue.extend({
  template: '#template_price',
  components: {
    section1: PriceSectionVue.extend({
      template: '#template_price_section_1'
    }),
    menu: SectionMenuVue
  }
})

var app = new Vue({
  el: document.documentElement,
  ready: function () {
    var vue = this
    var el = vue.$el
  },
  components: {
    home: HomeSliderVue,
    'hard-cover': HardCoverSliderVue,
    'soft-cover': SoftCoverSliderVue,
    'make-step': MakeStepSliderVue,
    price: PriceSliderVue
  },
  directives: {
    activable: {
      bind: function () {
        var el = this.el

        el.addEventListener('touchstart', function (e) {
          var el = e.currentTarget
          el.classList.add('active')
        })

        el.addEventListener('touchend', function (e) {
          var el = e.currentTarget
          el.classList.remove('active')
        })
      }
    }
  },
  events: {
    open: function (name) {
      var location = './' + name + '.html'

      if (name === 'index')
        location += '#menu'

      window.location = location
    }
  }
})