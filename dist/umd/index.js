!function(t,i){"object"==typeof exports&&"undefined"!=typeof module?i(exports):"function"==typeof define&&define.amd?define(["exports"],i):i((t="undefined"!=typeof globalThis?globalThis:t||self).monomove={})}(this,(function(t){"use strict";function i(t,i,e){return i in t?Object.defineProperty(t,i,{value:e,enumerable:!0,configurable:!0,writable:!0}):t[i]=e,t}function e(t,i){return o(t,n(t,i,"get"))}function s(t,i,e){return r(t,n(t,i,"set"),e),e}function n(t,i,e){if(!i.has(t))throw new TypeError("attempted to "+e+" private field on non-instance");return i.get(t)}function h(t,i,e){return c(t,i),u(e,"get"),o(t,e)}function l(t,i,e,s){return c(t,i),u(e,"set"),r(t,e,s),s}function a(t,i,e){return c(t,i),e}function o(t,i){return i.get?i.get.call(t):i.value}function r(t,i,e){if(i.set)i.set.call(t,e);else{if(!i.writable)throw new TypeError("attempted to set read only private field");i.value=e}}function c(t,i){if(t!==i)throw new TypeError("Private static access of wrong provenance")}function u(t,i){if(void 0===t)throw new TypeError("attempted to "+i+" private static field before its declaration")}function w(t,i,e){if(!i.has(t))throw new TypeError("attempted to get private field on non-instance");return e}function d(t,i){if(i.has(t))throw new TypeError("Cannot initialize the same private elements twice on an object")}function v(t,i,e){d(t,i),i.set(t,e)}function f(t,i){d(t,i),i.add(t)}var p=new WeakMap,b=new WeakMap,g=new WeakMap,m=new WeakMap,y=new WeakMap,T=new WeakMap,k=new WeakMap,M=new WeakMap,W=new WeakMap,I=new WeakSet,S=new WeakSet,O=new WeakSet;class x{constructor(t){let i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:0,h=arguments.length>3&&void 0!==arguments[3]?arguments[3]:0;f(this,O),f(this,S),f(this,I),v(this,p,{writable:!0,value:void 0}),v(this,b,{writable:!0,value:void 0}),v(this,g,{writable:!0,value:void 0}),v(this,m,{writable:!0,value:void 0}),v(this,y,{writable:!0,value:void 0}),v(this,T,{writable:!0,value:void 0}),v(this,k,{writable:!0,value:void 0}),v(this,M,{writable:!0,value:void 0}),v(this,W,{writable:!0,value:void 0});let l=t,a=i,o=n,r=h;if(s(this,p,16),s(this,b,11),this.setCacheSize(e(this,b)),"string"==typeof l){const t=l.split(",");l=Number(t[0]),a=Number(t[1]),o=Number(t[2]),r=Number(t[3])}s(this,y,l),s(this,T,a),s(this,k,o),s(this,M,r),s(this,W,!1)}get(t){return e(this,W)||w(this,S,V).call(this),0===t?0:1===t?1:a(x,x,P).call(x,w(this,O,F).call(this,t),e(this,T),e(this,M))}setIterations(t){s(this,p,t)}setCacheSize(t){s(this,b,t),s(this,g,1/(e(this,b)-1)),s(this,m,new Array(e(this,b))),s(this,W,!1)}}function P(t,i,e){return(((1-3*e+3*i)*t+(3*e-6*i))*t+3*i)*t}function E(t,i,e){return 3*(1-3*e+3*i)*t**2+2*(3*e-6*i)*t+3*i}function j(t,i,s,n){let h=i;for(let i=0;i<e(this,p);++i){const i=a(x,x,E).call(x,h,s,n);if(0===i)return h;h-=(a(x,x,P).call(x,h,s,n)-t)/i}return h}function V(){for(let t=0;t<e(this,b);++t)e(this,m)[t]=a(x,x,P).call(x,t*e(this,g),e(this,y),e(this,k));s(this,W,!0)}function F(t){const i=e(this,b)-1;let s=0,n=1;for(;n!==i&&e(this,m)[n]<=t;++n)s+=e(this,g);--n;const h=s+(t-e(this,m)[n])/(e(this,m)[n+1]-e(this,m)[n])*e(this,g);return w(this,I,j).call(this,t,h,e(this,y),e(this,k))}class A{static getAll(){return h(this,A,C)}static removeAll(){h(this,A,C).forEach((t=>{t.isPlaying=!1})),h(this,A,C).length=0,l(this,A,D,new Map)}static add(t){h(this,A,C).push(t)}static remove(t){const i=h(this,A,C).indexOf(t);-1!==i&&h(this,A,C).splice(i,1)}static onlyHasDelayedTweens(t){return h(this,A,C).length>0&&h(this,A,C).every((i=>t<i.startTime))}static onTick(t){return 0!==h(this,A,C).length&&(l(this,A,B,t),h(this,A,H).length=0,h(this,A,C).forEach(a(this,A,z),this),h(this,A,H).forEach(a(this,A,L),this),!0)}static setBezierIterations(t){this.bezierIterations=t}static setBezierCacheSize(t){this.bezierCacheSize=t}static getEasingFromCache(t){return h(this,A,D).has(t)||h(this,A,D).set(t,new x(t)),h(this,A,D).get(t)}}function L(t){t.isPlaying||this.remove(t)}function z(t){t.update(h(this,A,B))||h(this,A,H).push(t)}var C={writable:!0,value:[]},H={writable:!0,value:[]},B={writable:!0,value:0},D={writable:!0,value:new Map};i(A,"bezierIterations",null),i(A,"bezierCacheSize",null);class R{static stop(t){l(this,R,_,!1),window.cancelAnimationFrame(h(this,R,Q)),t&&t()}static add(t,i,e){const s={context:t,funk:i,cleanUp:e,isPlaying:!0};h(this,R,N).push(s),s.cleanUp&&h(this,R,Y).push(s),this.trigger()}static reset(){h(this,R,N).length=0,h(this,R,Y).length=0,A.removeAll()}static remove(t,i){const e=e=>!(e.context===t&&(!i||e.funk===i));l(this,R,N,h(this,R,N).filter(e)),l(this,R,Y,h(this,R,Y).filter(e)),this.trigger()}static trigger(){l(this,R,tt,!1),h(this,R,K)||(l(this,R,K,!0),l(this,R,Q,window.requestAnimationFrame(a(this,R,U).bind(this))))}static getTime(){return l(this,R,Z,window.performance.now()-h(this,R,X)),h(this,R,Z)}static pause(){h(this,R,_)&&(l(this,R,G,window.performance.now()),l(this,R,K,!1),this.stop())}static play(){h(this,R,_)||(l(this,R,X,h(this,R,X)+(window.performance.now()-h(this,R,G))),l(this,R,_,!0),this.trigger())}static isPlaying(){return h(this,R,_)}}function U(){const t=()=>{l(this,R,Z,window.performance.now()-h(this,R,X)),l(this,R,q,h(this,R,J)?h(this,R,Z)-h(this,R,J):0);const i=A.onTick(h(this,R,Z));if(l(this,R,$,0),h(this,R,_)&&!h(this,R,tt))for(let t=0;t<h(this,R,N).length;t++){const i=h(this,R,N)[t];var e;if(i.isPlaying)i.funk.call(i.context,h(this,R,q))&&l(this,R,$,(e=h(this,R,$),++e))}if(h(this,R,_)&&(h(this,R,$)>0||i)?l(this,R,Q,window.requestAnimationFrame(t)):l(this,R,K,!1),!h(this,R,tt))for(let t=0;t<h(this,R,Y).length;t++){const i=h(this,R,Y)[t];i.isPlaying&&i.cleanUp.call(i.context)}l(this,R,tt,0===h(this,R,$)&&A.onlyHasDelayedTweens(h(this,R,Z))),l(this,R,J,h(this,R,Z))};t()}var N={writable:!0,value:[]},Y={writable:!0,value:[]},$={writable:!0,value:0},_={writable:!0,value:!1},q={writable:!0,value:0},X={writable:!0,value:0},G={writable:!0,value:0},J={writable:!0,value:0},K={writable:!0,value:!1},Q={writable:!0,value:0},Z={writable:!0,value:0},tt={writable:!0,value:!1},it=new WeakMap,et=new WeakMap,st=new WeakMap,nt=new WeakMap,ht=new WeakMap,lt=new WeakMap,at=new WeakMap,ot=new WeakMap,rt=new WeakMap,ct=new WeakMap,ut=new WeakMap,wt=new WeakMap,dt=new WeakMap,vt=new WeakMap,ft=new WeakMap,pt=new WeakMap,bt=new WeakMap,gt=new WeakSet,mt=new WeakSet;class yt{constructor(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:1;f(this,mt),f(this,gt),i(this,"durationMS",null),i(this,"isPlaying",null),i(this,"delayTime",null),i(this,"startTime",null),i(this,"easingFunction",null),i(this,"object",null),i(this,"value",null),v(this,it,{writable:!0,value:void 0}),v(this,et,{writable:!0,value:void 0}),v(this,st,{writable:!0,value:void 0}),v(this,nt,{writable:!0,value:void 0}),v(this,ht,{writable:!0,value:void 0}),v(this,lt,{writable:!0,value:void 0}),v(this,at,{writable:!0,value:void 0}),v(this,ot,{writable:!0,value:void 0}),v(this,rt,{writable:!0,value:void 0}),v(this,ct,{writable:!0,value:void 0}),v(this,ut,{writable:!0,value:void 0}),v(this,wt,{writable:!0,value:void 0}),v(this,dt,{writable:!0,value:void 0}),v(this,vt,{writable:!0,value:void 0}),v(this,ft,{writable:!0,value:void 0}),v(this,pt,{writable:!0,value:void 0}),v(this,bt,{writable:!0,value:void 0}),"function"==typeof t&&void 0!==n?(this.object={value:0},s(this,it,t),s(this,et,{value:1}),this.durationMS=1e3*n):(this.object=t,s(this,et,{}),s(this,it,null),this.durationMS=1e3),s(this,nt,0),s(this,ht,0),s(this,lt,null),s(this,at,null),s(this,ot,null),s(this,rt,!1),s(this,ct,null),s(this,ut,null),s(this,wt,null),s(this,dt,null),s(this,vt,null),s(this,ft,0),s(this,pt,{}),s(this,st,[]),s(this,bt,null),this.easingFunction=t=>t,this.value=0,this.delayTime=0,this.isPlaying=!1,this.startTime=null,Object.keys(this.object).forEach((t=>{e(this,pt)[t]=this.object[t]}))}from(t){return Object.keys(t).forEach((i=>{this.object[i]=t[i]})),null!==e(this,it)&&e(this,it).call(this,this.object,this.value,0),this}to(t,i){return void 0!==i&&(this.durationMS=1e3*i),s(this,et,t),e(this,st).length=0,this}duration(t){return this.durationMS=1e3*t,this}rewind(){return Object.keys(this.object).forEach((t=>{this.object[t]=e(this,pt)[t]})),this.value=this.easingFunction(0),this}restart(){return this.rewind().start()}loop(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:1/0;return s(this,nt,t),s(this,ht,t),this}startTween(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:R.getTime();const i=this.isPlaying;return s(this,ft,0),s(this,rt,!1),this.isPlaying=!0,this.startTime=t+this.delayTime,0===e(this,st).length&&Object.keys(e(this,et)).forEach((t=>{e(this,pt)[t]=this.object[t],e(this,st).push(t,e(this,et)[t])})),0===this.durationMS&&0===e(this,nt)&&0===this.delayTime?(this.update(t),this.isPlaying=!1):i||(A.add(this),R.trigger()),this}start(){for(var t=arguments.length,i=new Array(t),n=0;n<t;n++)i[n]=arguments[n];const h=e(this,at);return new Promise((t=>{s(this,at,(()=>{h&&h(),t(this)})),this.startTween(...i)}))}stop(){return this.isPlaying?(this.isPlaying=!1,A.remove(this),this):this}delay(t){return this.delayTime=1e3*t,this}easing(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:t=>t,{iterations:i=A.bezierIterations,cacheSize:e=A.bezierCacheSize}=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},s=t;return s?("string"==typeof s&&(s=A.getEasingFromCache(s),i&&s.setIterations(i),e&&s.setCacheSize(e)),s.get?this.easingFunction=s.get.bind(s):this.easingFunction=s,this):this}onStart(t){return s(this,ot,t),this}onUpdate(t){return s(this,it,t),this}onComplete(){return s(this,at,arguments.length>0&&void 0!==arguments[0]?arguments[0]:null),this}onTimelineIn(t){return s(this,ct,t),this}onTimelineOut(t){return s(this,ut,t),this}onTimelineVisible(t){return s(this,wt,t),this}onTimelineInvisible(t){return s(this,dt,t),this}updateAllValues(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0;if(this.value!==e(this,bt)){for(let t=0;t<e(this,st).length;t+=2)w(this,mt,Tt).call(this,e(this,st)[t],e(this,st)[t+1]);null!==e(this,it)&&e(this,it).call(this,this.object,this.value,t),s(this,bt,this.value)}}invalidate(){return s(this,bt,null),this}update(t){if(t<this.startTime)return!0;!1===e(this,rt)&&(null!==e(this,ot)&&e(this,ot).call(this,this.object),s(this,rt,!0),R.trigger()),s(this,ft,t-this.startTime);const i=0===this.durationMS?1:Math.min(e(this,ft)/this.durationMS,1);this.value=this.easingFunction(i),null===e(this,vt)&&s(this,vt,t);const n=t-e(this,vt);if(s(this,vt,t),this.updateAllValues(n),1===i){const i=this.startTime;var h;return e(this,ht)>0?(e(this,lt)&&e(this,lt).call(this,this.object,e(this,nt)-e(this,ht)),s(this,ht,(h=e(this,ht),--h)),this.restart()):e(this,at)&&this.isPlaying&&e(this,at).call(this,this.object,t-this.startTime),this.isPlaying=!(i===this.startTime),!1}return!0}}function Tt(t,i){const s=e(this,pt)[t];this.object[t]=s+(i-s)*this.value}class kt{constructor(){let{delay:t=0}=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};i(this,"previousPosition",null),i(this,"delay",null),this.previousPosition=0,this.delay=t}static setTweenIn(t,i){t.timelineIn=i,t.timelineIn!==t.previousTimelineIn&&(i&&t.onTimelineIn?t.onTimelineIn(t.object):!i&&t.onTimelineOut&&t.onTimelineOut(t.object),t.previousTimelineIn=t.timelineIn)}static setTweenVisibility(t,i){t.timelineVisible=i,t.timelineVisible!==t.previousTimelineVisible&&(i&&t.onTimelineVisible?t.onTimelineVisible(t.object):!i&&t.onTimelineInvisible&&t.onTimelineInvisible(t.object),t.previousTimelineVisible=t.timelineVisible)}}function Mt(t,i){let e=arguments.length>2&&void 0!==arguments[2]?arguments[2]:Number.MAX_VALUE;return t<i?i:t>e?e:t}class Wt extends kt{constructor(t,i){super(i),this.tweens=t.reduce(((t,i,e)=>this.addTween(t,i,0===e?this.delay:0)),[]),this.totalTime=this.tweens.reduce(((t,i)=>t+i.delayTime+i.durationMS),0)}addTween(t,i){let e=arguments.length>2&&void 0!==arguments[2]?arguments[2]:0;if(i instanceof this.constructor)for(let e=0;e<i.tweens.length;e++){const s=i.tweens[e];this.addTween(t,s,0===e?i.delay:0)}else e&&(i.delayTime+=1e3*e),t.push(i);return t}setPosition(t){const i=Mt(t,0,1)*this.totalTime;let e=this.totalTime;for(let t=this.tweens.length-1;t>=0;t--){const s=this.tweens[t],n=s.durationMS;if(e-=s.delayTime+n,!(e+s.delayTime>i))break;s.value=0,Wt.setTweenVisibility(s,!1),Wt.setTweenIn(s,!1),s.invalidate(),s.updateAllValues()}e=0;for(let t=0;t<this.tweens.length;t++){const s=this.tweens[t],n=s.durationMS,h=s.delayTime+n,l=e+s.delayTime;if(e+=h,e<=i)s.value=1,Wt.setTweenVisibility(s,!0),Wt.setTweenIn(s,!1);else{if(!(l<=i))break;{const t=Mt((i-l)/n,0,1);s.value=s.easingFunction(t),Wt.setTweenVisibility(s,!0),Wt.setTweenIn(s,!0)}}s.invalidate(),s.updateAllValues()}}update(){this.setPosition(this.previousPosition||0)}async start(){this.tweens.forEach((t=>t.start()))}}class It extends kt{constructor(t,i){super(i),this.tweens=t.reduce(((t,i)=>this.addTween(t,i,this.delay)),[]).sort(((t,i)=>t.delayTime-i.delayTime)),this.totalTime=this.tweens.reduce(((t,i)=>Math.max(t,i.delayTime+i.durationMS)),0)}addTween(t,i){let e=arguments.length>2&&void 0!==arguments[2]?arguments[2]:0;return i instanceof this.constructor?i.tweens.forEach((s=>this.addTween(t,s,e+i.delay))):(e&&(i.delayTime+=1e3*e),t.push(i)),t}setPosition(t){const i=Mt(t,0,1)*this.totalTime;for(let t=this.tweens.length-1;t>=0;t--){const e=this.tweens[t];if(!(e.delayTime>i))break;e.value=0,It.setTweenVisibility(e,!1),It.setTweenIn(e,!1),e.invalidate(),e.updateAllValues()}for(let t=0;t<this.tweens.length;t++){const e=this.tweens[t],s=e.durationMS,n=e.delayTime+s,h=e.delayTime;if(n<=i)e.value=1,It.setTweenVisibility(e,!0),It.setTweenIn(e,!1);else{if(!(h<=i))break;{const t=Mt((i-h)/s,0,1);e.value=e.easingFunction(t),It.setTweenVisibility(e,!0),It.setTweenIn(e,!0)}}e.invalidate(),e.updateAllValues()}this.previousPosition=t}update(){this.setPosition(this.previousPosition||0)}async start(){await Promise.all(this.tweens.map((t=>t.start())))}}let St=!1;try{const t=Object.defineProperty({},"passive",{get:()=>(St=!0,!0)});window.addEventListener("a",null,t),window.removeEventListener("a",null,t)}catch(t){}var Ot=new WeakMap,xt=new WeakMap,Pt=new WeakMap,Et=new WeakMap,jt=new WeakMap,Vt=new WeakMap,Ft=new WeakMap,At=new WeakMap,Lt=new WeakMap,zt=new WeakMap,Ct=new WeakMap,Ht=new WeakMap,Bt=new WeakMap,Dt=new WeakMap,Rt=new WeakMap,Ut=new WeakMap,Nt=new WeakMap,Yt=new WeakMap,$t=new WeakMap,_t=new WeakMap,qt=new WeakMap,Xt=new WeakMap,Gt=new WeakMap,Jt=new WeakMap,Kt=new WeakMap,Qt=new WeakMap,Zt=new WeakSet,ti=new WeakSet,ii=new WeakSet,ei=new WeakSet;class si{constructor(){let{container:t=window.document.body,content:n=window.document.body,scrollFactor:h=1,listener:l=window,debug:a=!1}=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};f(this,ei),f(this,ii),f(this,ti),f(this,Zt),i(this,"isDown",!1),i(this,"isLocked",!1),i(this,"scroll",0),i(this,"scrollHeight",0),v(this,Ot,{writable:!0,value:.01}),v(this,xt,{writable:!0,value:1}),v(this,Pt,{writable:!0,value:0}),v(this,Et,{writable:!0,value:0}),v(this,jt,{writable:!0,value:0}),v(this,Vt,{writable:!0,value:[]}),v(this,Ft,{writable:!0,value:null}),v(this,At,{writable:!0,value:null}),v(this,Lt,{writable:!0,value:null}),v(this,zt,{writable:!0,value:!1}),v(this,Ct,{writable:!0,value:0}),v(this,Ht,{writable:!0,value:0}),v(this,Bt,{writable:!0,value:null}),v(this,Dt,{writable:!0,value:null}),v(this,Rt,{writable:!0,value:null}),v(this,Ut,{writable:!0,value:null}),v(this,Nt,{writable:!0,value:!0}),v(this,Yt,{writable:!0,value:!1}),v(this,$t,{writable:!0,value:!1}),v(this,_t,{writable:!0,value:(new yt).easing("0.35,0.15,0,1").onUpdate((t=>{window.scrollTo(0,t.y),s(this,zt,!0),this.scroll=t.y,s(this,Pt,t.y),this.isDown=e(this,Pt)>=e(this,Et),s(this,Et,e(this,Pt))})).onStart((()=>{s(this,$t,!0)})).onComplete((()=>{s(this,$t,!1)}))}),v(this,qt,{writable:!0,value:!!St&&{passive:!0}}),v(this,Xt,{writable:!0,value:null}),v(this,Gt,{writable:!0,value:null}),v(this,Jt,{writable:!0,value:null}),v(this,Kt,{writable:!0,value:null}),v(this,Qt,{writable:!0,value:null}),s(this,Xt,h),s(this,Gt,t),s(this,Jt,n),s(this,Kt,l),s(this,Qt,a),s(this,Bt,(()=>{this.isLocked||s(this,Yt,!0)})),s(this,Dt,(()=>{this.isLocked||(s(this,zt,!0),s(this,Pt,this.getScrollPosition()))})),s(this,Ut,(t=>{t.stopPropagation(),this.isLocked||s(this,Yt,!1)})),s(this,Rt,(()=>{this.isLocked||(e(this,_t)&&e(this,_t).stop(),s(this,Yt,!1),s(this,$t,!1))})),e(this,Kt)&&(e(this,Qt),e(this,Kt).addEventListener("touchstart",e(this,Bt),e(this,qt)),e(this,Kt).addEventListener("scroll",e(this,Dt),e(this,qt)),e(this,Kt).addEventListener("mousedown",e(this,Ut),e(this,qt)),e(this,Kt).addEventListener("wheel",e(this,Rt),e(this,qt))),e(this,Qt)&&(s(this,At,window.document.createElement("canvas")),e(this,Gt).appendChild(e(this,At))),R.add(this,w(this,Zt,ni)),this.resize()}draw(){w(this,ti,hi).call(this)}drawAll(){const t=e(this,Ft);s(this,Ft,e(this,Vt)),w(this,ti,hi).call(this),s(this,Ft,t)}getScrollPosition(){return void 0!==e(this,Kt).scrollY?e(this,Kt).scrollY:void 0!==e(this,Kt).pageYOffset?e(this,Kt).pageYOffset:void 0!==e(this,Kt).scrollTop?e(this,Kt).scrollTop:0}resize(){e(this,Gt)&&e(this,Jt)&&(this.scroll=s(this,Et,e(this,Pt)),this.scrollHeight=e(this,Jt).scrollHeight,s(this,jt,window.innerHeight),e(this,Vt).forEach((t=>{w(this,ei,ai).call(this,t)})),e(this,At)&&(e(this,At).width=window.innerWidth*window.devicePixelRatio,e(this,At).height=window.innerHeight*window.devicePixelRatio,e(this,At).style.position="fixed",e(this,At).style.left=0,e(this,At).style.top=0,e(this,At).style.width=`${window.innerWidth}px`,e(this,At).style.height=`${window.innerHeight}px`,e(this,At).style.pointerEvents="none",e(this,At).style.zIndex=9999999,s(this,Lt,e(this,At).getContext("2d"))),w(this,ii,li).call(this))}triggerAnimations(){let t=arguments.length>0&&void 0!==arguments[0]&&arguments[0];const i=window.devicePixelRatio;e(this,Lt)&&(e(this,Lt).clearRect(0,0,e(this,At).width,e(this,At).height),e(this,Lt).strokeStyle="#f00",e(this,Lt).lineWidth=2*i,e(this,Lt).beginPath()),e(this,t?Vt:Ft).forEach((t=>{const s=t.box;if(!s||!s.width||!s.height)return;const n=t.animationObject;n.scroll=this.scroll;const h=t.directionOffset||0,l=t.offset||0,a=s.top+s.height-n.scroll+h*(this.isDown?-1:1)*e(this,jt)+l*e(this,jt),o=a/(e(this,jt)+s.height),r=(a-e(this,jt))/s.height;n.rawFactor=(1-o-.5)*t.speed+.5,n.rawBoxFactor=(1-r-.5)*t.speed+.5,n.factor=Mt(n.rawFactor,0,1),n.isInView=n.rawFactor>=0&&n.rawFactor<=1,n.boxFactor=Mt(n.rawBoxFactor,0,1),n.boxIsInView=n.rawBoxFactor>=0&&n.rawBoxFactor<=1,n.box=s,n.item=t.item,n.fixedTop&&(n.box.top=n.fixedTop),n.isInView!==n.previousIsInView&&(n.isInView?(n.isScrolledIn=!0,void 0===n.isScrolledInOnce&&(n.isScrolledInOnce=!0)):void 0!==n.previousIsInView&&(n.isScrolledOut=!0,void 0===n.isScrolledOutOnce&&(n.isScrolledOutOnce=!0))),t.animation&&t.previousFactor!==n.factor&&(t.animation(n),t.previousFactor=n.factor),n.isScrolledIn=!1,n.isScrolledOut=!1,!0===n.isScrolledInOnce&&(n.isScrolledInOnce=!1),!0===n.isScrolledOutOnce&&(n.isScrolledOutOnce=!1),n.previousIsInView=n.isInView,e(this,Lt)&&n.box.top+n.box.height-n.scroll>=0&&n.box.top-n.scroll<=e(this,jt)&&e(this,Lt).rect(n.box.left*i,n.box.top*i-n.scroll*i,n.box.width*i,n.box.height*i)})),e(this,Lt)&&e(this,Lt).stroke()}add(t,i){let n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};const h=t&&t instanceof Array?t:[t];void 0===n.observeIn&&(n.observeIn=null),h.forEach((t=>{const h={centerOffset:0,originalTop:0,isVisible:!0};let l=null;window.IntersectionObserver&&void 0!==n.observeIn?(l=new window.IntersectionObserver((t=>{t.forEach((t=>{h.isVisible=t.isIntersecting,w(this,ii,li).call(this)}))}),{root:n.observeIn,rootMargin:`${n.directionOffset?100*n.directionOffset:n.speed?1/n.speed*100:0}% 0% ${n.directionOffset?100*n.directionOffset:n.offset?100*n.offset:n.speed?1/n.speed*100:0}% 0%`,threshold:0}),l.observe(t)):s(this,Ft,null);const a={animation:i,directionOffset:n.directionOffset||0,offset:n.offset||0,speed:void 0===n.speed?1:n.speed,animationObject:h,item:t,observer:l};w(this,ei,ai).call(this,a),e(this,Vt).push(a)}))}remove(t){const i=t&&t instanceof Array?t:[t];s(this,Vt,e(this,Vt).filter((t=>i.indexOf(t.item)<0)))}static getBox(t){let i=t,e=0,s=0;do{if(void 0===i.offsetLeft){const t=i.getBoundingClientRect(),n=window.document.documentElement;e+=t.left+window.pageXOffset-n.clientLeft,s+=t.top+window.pageYOffset-n.clientTop}else e+=i.offsetLeft,s+=i.offsetTop;i=i.offsetParent}while(i);if(void 0===t.offsetWidth){const i=t.getBoundingClientRect();return{left:e,top:s,width:i.width,height:i.height}}return{left:e,top:s,width:t.offsetWidth,height:t.offsetHeight}}scrollTo(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;return e(this,_t).from({y:this.scroll}).to({y:t},i??Mt(25e-5*Math.abs(t-this.scroll),.25,2.5)).start()}scrollToElement(t){let i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,e=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null;const s=si.getBox(t);return this.scrollTo(s.top,i,e)}reset(){e(this,Vt).length=0,s(this,jt,0)}stop(){s(this,zt,!1)}lock(){this.isLocked=!0}unlock(){this.isLocked=!1,window.scrollTo(0,this.scroll)}setContent(t){s(this,Jt,t),this.resize()}unsetContent(){s(this,Jt,null)}destroy(){e(this,Qt)&&e(this,At).remove(),e(this,Kt)&&(e(this,Qt),e(this,Kt).removeEventListener("touchstart",e(this,Bt),e(this,qt)),e(this,Kt).removeEventListener("wheel",e(this,Rt),e(this,qt)),e(this,Kt).removeEventListener("mousedown",e(this,Ut),e(this,qt)),e(this,Kt).removeEventListener("scroll",e(this,Dt),e(this,qt))),this.reset(),this.stop()}}function ni(){if(this.isLocked)return!0;if(this.scrollHeight=e(this,Jt)?e(this,Jt).scrollHeight:0,this.scrollHeight!==e(this,Ht))return this.resize(),this.scroll=e(this,Pt),w(this,ti,hi).call(this,this.scroll),s(this,Ht,this.scrollHeight),!0;if(!e(this,zt))return!0;const t=(e(this,Pt)-this.scroll)*(e(this,Yt)?e(this,xt):e(this,Xt));if(Math.abs(t)<e(this,Ot)&&(e(this,Yt)&&this.triggerAnimations(!0),s(this,zt,!1)),this.scroll+=t,e(this,Nt)){s(this,Nt,!1),this.scroll=e(this,Pt),e(this,Qt);const t=this.isDown;this.isDown=!0,this.triggerAnimations(!0),this.isDown=!1,this.triggerAnimations(!0),this.isDown=t}return null===e(this,Ft)&&s(this,Ft,e(this,Vt)),w(this,ti,hi).call(this,this.scroll),!0}function hi(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0;this.isDown=t>=e(this,Et),e(this,Ft)&&(this.triggerAnimations(),s(this,Et,t))}function li(){s(this,Ft,e(this,Vt).filter((t=>t.animationObject.isVisible))),e(this,Qt)}function ai(t){t.box=si.getBox(t.item),t.animationObject.centerOffset=.5*(e(this,jt)-t.box.height),t.animationObject.originalTop=t.box.top,t.animationObject.scroll=t.animationObject.targetScroll=e(this,Pt)}
/**
   * @license
   * Monomove - utilities for moving things
   * 
   * Copyright © 2021-2022 Monokai (monokai.nl)
   * 
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the “Software”), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   * 
   * The above copyright notice and this permission notice shall be included in all
   * copies or substantial portions of the Software.
   * 
   * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   * SOFTWARE.
  */const oi=yt;t.RenderLoop=R,t.SmoothScroller=si,t.Timeline=It,t.Tween=oi,t.TweenChain=Wt,t.TweenManager=A,t.delay=async t=>new yt((()=>!0),0).delay(t).start(),Object.defineProperty(t,"__esModule",{value:!0})}));
