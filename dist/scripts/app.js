var SliderVue = Vue.extend({
  data: function () {
    return {
      scrollTop: 0,
      height: 0,
      v: 0,
      count: 0
    }
  },
  ready: function () {
    var vue = this
    var el = vue.$el

    vue.$broadcast('ready')

    kDrag.bind(el)

    el.addEventListener('touchstart', function (e) {
      vue.onTouchstart(e)
    })
    el.addEventListener('k.drag', function (e) {
      vue.onDrag(e)
    })
    el.addEventListener('k.dragend', function (e) {
      vue.onDragend(e)
    })
    el.addEventListener('touchend', function (e) {
      vue.onTouchend(e)
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
    onTouchstart: function (e) {
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
    onTouchend: function (e) {
      var v = this.v
      var absV = Math.abs(v)

      var duration

      if (Math.abs(absV) > 0.5) {
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
      duration = duration || 400

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
          translateY: -vue.height * 1.1
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
  },
  components: {
    'btn-return': {
      template: '#template_section_button_return',
      replace: true,
      methods: {
        returnToHome: function () {
          this.$dispatch('returnToHome')
        }
      }
    },
    stamp: {
      template: '#template_hard_cover_stamp',
      replace: true
    }
  }
})

var HomeSliderVue = SliderVue.extend({
  template: '#template_home',
  ready: function () {
    var vue = this
    setTimeout(function () {
      vue.$broadcast('animationend')
    }, 4000)
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
        animationend: function () {
          this.$el.removeEventListener('touchstart', this.preventTouch)
        }
      },
      methods: {
        preventTouch: function (e) {
          e.stopPropagation()
          e.preventDefault()
        }
      }
    }),
    menu: SectionVue.extend({
      template: '#template_menu',
      ready: function () {
        this.$el.style.display = 'none'
      },
      events: {
        animationend: function () {
          this.$el.style.display = 'block'
        }
      }
    })
  }
})

var HardCoverSliderVue = SliderVue.extend({
  template: '#template_hard_cover',
  components: {
    section1: SectionVue.extend({
      template: '#template_hard_cover_section_1'
    }),
    section2: SectionVue.extend({
      template: '#template_hard_cover_section_2'
    }),
    section3: SectionVue.extend({
      template: '#template_hard_cover_section_3'
    }),
    section4: SectionVue.extend({
      template: '#template_hard_cover_section_4'
    }),
    section5: SectionVue.extend({
      template: '#template_hard_cover_section_5'
    }),
    section6: SectionVue.extend({
      template: '#template_hard_cover_section_6'
    }),
    section7: SectionVue.extend({
      template: '#template_hard_cover_section_7'
    }),
    section8: SectionVue.extend({
      template: '#template_hard_cover_section_8'
    })
  }
})

var app = new Vue({
  el: document.documentElement,
  components: {
    home: HomeSliderVue,
    'hard-cover': HardCoverSliderVue
  }
})