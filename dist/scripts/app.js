var SliderVue = Vue.extend({
  data: function () {
    return {
      scrollTop: 0,
      height: 0,
      v: 0,
      count: 0
    }
  },
  computed: {
    current: {
      get: function () {
        return Math.floor(this.scrollTop / this.height) + 1 || 1
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
  watch: {
    scrollTop: function (value) {
      if (value > this.maxScroll)
        this.scrollTop = this.maxScroll
      else if (value < 0)
        this.scrollTop = 0
    }
  },
  replace: true,
  events: {
    sectionCreated: function () {
      this.count++
    }
  },
  methods: {
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
    },
    onTouchstart: function (e) {
      this.v = 0
      this.$broadcast('stopAnimation')
    },
    onDrag: function (e) {
      var vue = this
      vue.scrollTop -= e.stepY
    },
    onDragend: function (e) {
      this.v = e.vy
    },
    onTouchend: function (e) {
      var v = this.v

      if (Math.abs(v) > 0.3) {
        if (v > 0)
          this.$broadcast('scrollByIndex', this.current)
        else
          this.$broadcast('scrollByIndex', this.current + 1)
      } else {
        if (this.scrollTop - this.height * (this.current - 1) > this.height / 2) {
          this.$broadcast('scrollByIndex', this.current + 1)
        } else {
          this.$broadcast('scrollByIndex', this.current)
        }
      }
    },
    resize: function () {
      this.height = this.$el.clientHeight

      if (this.scrollTop - this.height * (this.current - 1) > this.height / 2) {
        this.$broadcast('scrollByIndex', this.current + 1)
      } else {
        this.$broadcast('scrollByIndex', this.current)
      }
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
    this.$emit('refreshDisplay')
  },
  watch: {
    scrollTop: function (value) {
      var vue = this
      var el = vue.$el

      var style = vue.computeStyle(value)

      if (!style)
        return

      if (document.documentElement.style.perspective !== undefined)
        Velocity.hook(el, 'translateZ', '.000001px')
      Velocity.hook(el, 'translateY', style.translateY)
    },
    current: function (value) {
      if (!value)
        return

      this.$emit('refreshDisplay')
    }
  },
  events: {
    refreshDisplay: function () {
      var vue = this
      var el = vue.$el

      // if (vue.index !== vue.current - 1 && vue.index !== vue.current && vue.index !== vue.current + 1) {
      //   if (this.index === 1)
      //     el.style.visibility = 'hidden'
      //   else
      //     // el.style.display = 'none'
      //     el.style.visibility = 'hidden'
      // } else {
      //   if (this.index === 1)
      //     el.style.visibility = 'visible'
      //   else
      //     // el.style.display = 'block'
      //     el.style.visibility = 'visible'
      // }
    },
    scrollByIndex: function (index) {
      var vue = this

      if (index > vue.count)
        return

      var el = vue.$el

      var scrollTop = vue.height * (index - 1)

      var style = vue.computeStyle(scrollTop)

      if (!style)
        return

      vue.$emit('stopAnimation')

      if (document.documentElement.style.perspective !== undefined)
        style.translateZ = '.000001px'

      Velocity(el, style, {
        duration: 260,
        easing: 'ease-out',
        complete: function () {
          vue.scrollTop = scrollTop
        }
      })
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
          translateY: sectionTranslateY + 'px',
        }
      }
      else if (vue.index === vue.current - 1) {
        return {
          translateY: (sectionTranslateY - vue.height - (sectionTranslateY) / 1.618) + 'px',
        }
      }
      else if (vue.index === vue.current + 1) {
        return {
          translateY: (sectionTranslateY + vue.height - (sectionTranslateY + vue.height) / 1.618) + 'px',
        }
      } else {
        return {
          translateY: vue.height * 2
        }
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
      vue.ready()  
    }, 4000)
  },
  components: {
    cover: SectionVue.extend({
      template: '#template_cover'
    }),
    menu: SectionVue.extend({
      template: '#template_menu',
      ready: function () {
        this.$el.style.display = 'none'
      },
      events: {
        ready: function () {
          this.$el.style.display = 'block'
        }
      }
    })
  }
})

var HardCoverSliderVue = SliderVue.extend({
  template: '#template_hard_cover',
  ready: function () {
    this.ready()
  },
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