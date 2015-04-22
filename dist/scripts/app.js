var SliderVue=Vue.extend({data:function(){return{scrollTop:0,height:0,v:0,count:0}},ready:function(){var e=this,t=e.$el;kDrag.bind(t),t.addEventListener("touchstart",function(){e.onTouchstart()}),t.addEventListener("k.drag",function(t){e.onDrag(t)}),t.addEventListener("k.dragend",function(t){e.onDragend(t)}),t.addEventListener("touchend",function(){e.onTouchend()}),e.resize(),window.addEventListener("resize",function(){e.resize()}),e.$broadcast("scrollByIndex",e.current,0)},computed:{current:{get:function(){var e=Math.floor(this.scrollTop/this.height)+1||1;return 1>e?e=1:e>this.count&&(e=this.count),e},set:function(e){e&&(this.scrollTop=this.height*(e-1))}},maxScroll:function(){return this.height*(this.count-1)}},replace:!0,events:{sectionCreated:function(){this.count++}},methods:{onTouchstart:function(){var e=this;e.v=0,e.$broadcast("stopAnimation")},onDrag:function(e){var t=this,n=e.stepY;t.scrollTop>t.maxScroll&&0>n?n=n/(t.scrollTop-n-t.maxScroll)*10:t.scrollTop<0&&n>0&&(n=n/-(t.scrollTop-n)*10),t.scrollTop-=n},onDragend:function(e){this.v=e.vy},onTouchend:function(){var e,t=this.v,n=Math.abs(t);Math.abs(n)>.382?(e=Math.max(400/n,260),t>0?this.$broadcast("scrollByIndex",this.current,e):this.$broadcast("scrollByIndex",this.current+1,e)):(e=400,this.scrollTop-this.height*(this.current-1)>this.height/2?this.$broadcast("scrollByIndex",this.current+1,e):this.$broadcast("scrollByIndex",this.current,e))},resize:function(){var e=this.current;this.height=this.$el.clientHeight,this.scrollTop=this.height*(e-1)}}}),SectionVue=Vue.extend({replace:!0,inherit:!0,paramAttributes:["index"],created:function(){this.$dispatch("sectionCreated")},compiled:function(){this.index=parseFloat(this.index)},ready:function(){void 0!==document.documentElement.style.perspective&&Velocity.hook(this.$el,"translateZ",".000001px")},watch:{scrollTop:function(e){var t=this,n=(t.$el,t.computeStyle(e));n&&t.setStyle(n)}},events:{scrollByIndex:function(e,t){void 0===t&&(t=400);var n=this;e>n.count?e=n.count:1>e&&(e=1);var o=n.$el,i=n.height*(e-1),c=n.computeStyle(i);c&&(n.$emit("stopAnimation"),0===t?(n.setStyle(c),n.scrollTop=i):Velocity(o,c,{duration:t,easing:"ease-out",complete:function(){n.scrollTop=i}}))},stopAnimation:function(){var e=this,t=e.$el;Velocity(t,"stop"),this.index===this.current&&(this.scrollTop=this.height*(this.current-1)-parseFloat(Velocity.hook(t,"translateY")))}},methods:{computeStyle:function(e){var t=this,n=(t.$el,t.height*(t.current-1)-e);return t.index===t.current?{translateY:n+"px"}:t.index===t.current-1?{translateY:n-t.height-n/1.618+"px"}:t.index===t.current+1?{translateY:n+t.height-(n+t.height)/1.618+"px"}:{translateY:1.1*-t.height+"px"}},setStyle:function(e){var t=this,n=t.$el;for(var o in e)Velocity.hook(n,o,e[o])}}}),SectionMenuVue=SectionVue.extend({template:"#template_menu",data:function(){return{showQRCode:!1,isWechat:navigator.userAgent.indexOf("MicroMessenger")>=0}},methods:{open:function(e){this.$dispatch("open",e)},stopPropagation:function(e){e.stopPropagation()}}}),HomeSliderVue=SliderVue.extend({template:"#template_home",ready:function(){{var e=this;e.$el}setTimeout(function(){e.$broadcast("unlock")},4e3),"#menu"===window.location.hash?(e.$broadcast("unlock"),e.$broadcast("scrollByIndex",2,0)):setTimeout(function(){e.$broadcast("unlock")},4e3)},components:{cover:SectionVue.extend({template:"#template_cover",ready:function(){var e=this,t=e.$el;t.addEventListener("touchstart",e.preventTouch)},events:{unlock:function(){this.$el.removeEventListener("touchstart",this.preventTouch)}},methods:{preventTouch:function(e){e.stopPropagation(),e.preventDefault()}},watch:{current:function(e){e===this.index&&(window.location.hash="#cover")}}}),menu:SectionMenuVue.extend({ready:function(){this.$el.style.display="none"},events:{unlock:function(){this.$el.style.display="block"}},watch:{current:function(e){e===this.index&&(window.location.hash="#menu")}}})}}),AppSectionVue=SectionVue.extend({components:{"btn-return":{template:"#template_section_button_return",replace:!0,methods:{returnToHome:function(){this.$dispatch("open","index")}}}}}),HardCoverSectionVue=AppSectionVue.extend({components:{stamp:{template:"#template_hard_cover_stamp",replace:!0}}}),HardCoverSliderVue=SliderVue.extend({template:"#template_hard_cover",components:{section1:HardCoverSectionVue.extend({template:"#template_hard_cover_section_1"}),section2:HardCoverSectionVue.extend({template:"#template_hard_cover_section_2"}),section3:HardCoverSectionVue.extend({template:"#template_hard_cover_section_3"}),section4:HardCoverSectionVue.extend({template:"#template_hard_cover_section_4"}),section5:HardCoverSectionVue.extend({template:"#template_hard_cover_section_5"}),section6:HardCoverSectionVue.extend({template:"#template_hard_cover_section_6"}),section7:HardCoverSectionVue.extend({template:"#template_hard_cover_section_7"}),section8:HardCoverSectionVue.extend({template:"#template_hard_cover_section_8"}),menu:SectionMenuVue}}),SoftCoverSectionVue=AppSectionVue.extend({components:{stamp:{template:"#template_soft_cover_stamp",replace:!0}}}),SoftCoverSliderVue=SliderVue.extend({template:"#template_soft_cover",components:{section1:SoftCoverSectionVue.extend({template:"#template_soft_cover_section_1"}),section2:SoftCoverSectionVue.extend({template:"#template_soft_cover_section_2"}),section3:SoftCoverSectionVue.extend({template:"#template_soft_cover_section_3"}),section4:SoftCoverSectionVue.extend({template:"#template_soft_cover_section_4"}),section5:SoftCoverSectionVue.extend({template:"#template_soft_cover_section_5"}),section6:SoftCoverSectionVue.extend({template:"#template_soft_cover_section_6"}),section7:SoftCoverSectionVue.extend({template:"#template_soft_cover_section_7"}),menu:SectionMenuVue}}),MakeStepSectionVue=AppSectionVue.extend({components:{stamp:{template:"#template_make_step_stamp",replace:!0}}}),MakeStepSliderVue=SliderVue.extend({template:"#template_make_step",components:{section1:MakeStepSectionVue.extend({template:"#template_make_step_section_1"}),section2:MakeStepSectionVue.extend({template:"#template_make_step_section_2"}),section3:MakeStepSectionVue.extend({template:"#template_make_step_section_3"}),section4:MakeStepSectionVue.extend({template:"#template_make_step_section_4"}),menu:SectionMenuVue}}),PriceSectionVue=AppSectionVue.extend({components:{stamp:{template:"#template_price_stamp",replace:!0}}}),PriceSliderVue=SliderVue.extend({template:"#template_price",components:{section1:PriceSectionVue.extend({template:"#template_price_section_1"}),menu:SectionMenuVue}}),app=new Vue({el:document.documentElement,ready:function(){{var e=this;e.$el}},components:{home:HomeSliderVue,"hard-cover":HardCoverSliderVue,"soft-cover":SoftCoverSliderVue,"make-step":MakeStepSliderVue,price:PriceSliderVue},directives:{activable:{bind:function(){var e=this.el;e.addEventListener("touchstart",function(e){var t=e.currentTarget;t.classList.add("active")}),e.addEventListener("touchend",function(e){var t=e.currentTarget;t.classList.remove("active")})}}},events:{open:function(e){var t="./"+e+".html";"index"===e&&(t+="#menu"),window.location=t}}});