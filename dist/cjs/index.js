"use strict";function t(t,i,e){return i in t?Object.defineProperty(t,i,{value:e,enumerable:!0,configurable:!0,writable:!0}):t[i]=e,t}function i(t,i){return a(t,s(t,i,"get"))}function e(t,i,e){return o(t,s(t,i,"set"),e),e}function s(t,i,e){if(!i.has(t))throw new TypeError("attempted to "+e+" private field on non-instance");return i.get(t)}function n(t,i,e){return r(t,i),c(e,"get"),a(t,e)}function h(t,i,e,s){return r(t,i),c(e,"set"),o(t,e,s),s}function l(t,i,e){return r(t,i),e}function a(t,i){return i.get?i.get.call(t):i.value}function o(t,i,e){if(i.set)i.set.call(t,e);else{if(!i.writable)throw new TypeError("attempted to set read only private field");i.value=e}}function r(t,i){if(t!==i)throw new TypeError("Private static access of wrong provenance")}function c(t,i){if(void 0===t)throw new TypeError("attempted to "+i+" private static field before its declaration")}function u(t,i,e){if(!i.has(t))throw new TypeError("attempted to get private field on non-instance");return e}function w(t,i){if(i.has(t))throw new TypeError("Cannot initialize the same private elements twice on an object")}function d(t,i,e){w(t,i),i.set(t,e)}function v(t,i){w(t,i),i.add(t)}Object.defineProperty(exports,"__esModule",{value:!0});var p=new WeakMap,f=new WeakMap,b=new WeakMap,g=new WeakMap,m=new WeakMap,y=new WeakMap,T=new WeakMap,k=new WeakMap,M=new WeakMap,W=new WeakSet,I=new WeakSet,S=new WeakSet;class x{constructor(t){let s=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:0,h=arguments.length>3&&void 0!==arguments[3]?arguments[3]:0;v(this,S),v(this,I),v(this,W),d(this,p,{writable:!0,value:void 0}),d(this,f,{writable:!0,value:void 0}),d(this,b,{writable:!0,value:void 0}),d(this,g,{writable:!0,value:void 0}),d(this,m,{writable:!0,value:void 0}),d(this,y,{writable:!0,value:void 0}),d(this,T,{writable:!0,value:void 0}),d(this,k,{writable:!0,value:void 0}),d(this,M,{writable:!0,value:void 0});let l=t,a=s,o=n,r=h;if(e(this,p,16),e(this,f,11),this.setCacheSize(i(this,f)),"string"==typeof l){const t=l.split(",");l=Number(t[0]),a=Number(t[1]),o=Number(t[2]),r=Number(t[3])}e(this,m,l),e(this,y,a),e(this,T,o),e(this,k,r),e(this,M,!1)}get(t){return i(this,M)||u(this,I,j).call(this),0===t?0:1===t?1:l(x,x,O).call(x,u(this,S,V).call(this,t),i(this,y),i(this,k))}setIterations(t){e(this,p,t)}setCacheSize(t){e(this,f,t),e(this,b,1/(i(this,f)-1)),e(this,g,new Array(i(this,f))),e(this,M,!1)}}function O(t,i,e){return(((1-3*e+3*i)*t+(3*e-6*i))*t+3*i)*t}function P(t,i,e){return 3*(1-3*e+3*i)*t**2+2*(3*e-6*i)*t+3*i}function E(t,e,s,n){let h=e;for(let e=0;e<i(this,p);++e){const i=l(x,x,P).call(x,h,s,n);if(0===i)return h;h-=(l(x,x,O).call(x,h,s,n)-t)/i}return h}function j(){for(let t=0;t<i(this,f);++t)i(this,g)[t]=l(x,x,O).call(x,t*i(this,b),i(this,m),i(this,T));e(this,M,!0)}function V(t){const e=i(this,f)-1;let s=0,n=1;for(;n!==e&&i(this,g)[n]<=t;++n)s+=i(this,b);--n;const h=s+(t-i(this,g)[n])/(i(this,g)[n+1]-i(this,g)[n])*i(this,b);return u(this,W,E).call(this,t,h,i(this,m),i(this,T))}class F{static getAll(){return n(this,F,L)}static removeAll(){n(this,F,L).forEach((t=>{t.isPlaying=!1})),n(this,F,L).length=0,h(this,F,B,new Map)}static add(t){n(this,F,L).push(t)}static remove(t){const i=n(this,F,L).indexOf(t);-1!==i&&n(this,F,L).splice(i,1)}static onlyHasDelayedTweens(t){return n(this,F,L).length>0&&n(this,F,L).every((i=>t<i.startTime))}static onTick(t){return 0!==n(this,F,L).length&&(h(this,F,H,t),n(this,F,C).length=0,n(this,F,L).forEach(l(this,F,z),this),n(this,F,C).forEach(l(this,F,A),this),!0)}static setBezierIterations(t){this.bezierIterations=t}static setBezierCacheSize(t){this.bezierCacheSize=t}static getEasingFromCache(t){return n(this,F,B).has(t)||n(this,F,B).set(t,new x(t)),n(this,F,B).get(t)}}function A(t){t.isPlaying||this.remove(t)}function z(t){t.update(n(this,F,H))||n(this,F,C).push(t)}var L={writable:!0,value:[]},C={writable:!0,value:[]},H={writable:!0,value:0},B={writable:!0,value:new Map};t(F,"bezierIterations",null),t(F,"bezierCacheSize",null);class D{static stop(t){h(this,D,$,!1),window.cancelAnimationFrame(n(this,D,K)),t&&t()}static add(t,i,e){const s={context:t,funk:i,cleanUp:e,isPlaying:!0};n(this,D,U).push(s),s.cleanUp&&n(this,D,N).push(s),this.trigger()}static reset(){n(this,D,U).length=0,n(this,D,N).length=0,F.removeAll()}static remove(t,i){const e=e=>!(e.context===t&&(!i||e.funk===i));h(this,D,U,n(this,D,U).filter(e)),h(this,D,N,n(this,D,N).filter(e)),this.trigger()}static trigger(){h(this,D,Z,!1),n(this,D,J)||(h(this,D,J,!0),h(this,D,K,window.requestAnimationFrame(l(this,D,R).bind(this))))}static getTime(){return h(this,D,Q,window.performance.now()-n(this,D,q)),n(this,D,Q)}static pause(){n(this,D,$)&&(h(this,D,X,window.performance.now()),h(this,D,J,!1),this.stop())}static play(){n(this,D,$)||(h(this,D,q,n(this,D,q)+(window.performance.now()-n(this,D,X))),h(this,D,$,!0),this.trigger())}static isPlaying(){return n(this,D,$)}}function R(){const t=()=>{h(this,D,Q,window.performance.now()-n(this,D,q)),h(this,D,_,n(this,D,G)?n(this,D,Q)-n(this,D,G):0);const i=F.onTick(n(this,D,Q));if(h(this,D,Y,0),n(this,D,$)&&!n(this,D,Z))for(let t=0;t<n(this,D,U).length;t++){const i=n(this,D,U)[t];var e;if(i.isPlaying)i.funk.call(i.context,n(this,D,_))&&h(this,D,Y,(e=n(this,D,Y),++e))}if(n(this,D,$)&&(n(this,D,Y)>0||i)?h(this,D,K,window.requestAnimationFrame(t)):h(this,D,J,!1),!n(this,D,Z))for(let t=0;t<n(this,D,N).length;t++){const i=n(this,D,N)[t];i.isPlaying&&i.cleanUp.call(i.context)}h(this,D,Z,0===n(this,D,Y)&&F.onlyHasDelayedTweens(n(this,D,Q))),h(this,D,G,n(this,D,Q))};t()}var U={writable:!0,value:[]},N={writable:!0,value:[]},Y={writable:!0,value:0},$={writable:!0,value:!1},_={writable:!0,value:0},q={writable:!0,value:0},X={writable:!0,value:0},G={writable:!0,value:0},J={writable:!0,value:!1},K={writable:!0,value:0},Q={writable:!0,value:0},Z={writable:!0,value:!1},tt=new WeakMap,it=new WeakMap,et=new WeakMap,st=new WeakMap,nt=new WeakMap,ht=new WeakMap,lt=new WeakMap,at=new WeakMap,ot=new WeakMap,rt=new WeakMap,ct=new WeakMap,ut=new WeakMap,wt=new WeakMap,dt=new WeakMap,vt=new WeakMap,pt=new WeakMap,ft=new WeakMap,bt=new WeakSet,gt=new WeakSet;class mt{constructor(){let s=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:1;v(this,gt),v(this,bt),t(this,"durationMS",null),t(this,"isPlaying",null),t(this,"delayTime",null),t(this,"startTime",null),t(this,"easingFunction",null),t(this,"object",null),t(this,"value",null),d(this,tt,{writable:!0,value:void 0}),d(this,it,{writable:!0,value:void 0}),d(this,et,{writable:!0,value:void 0}),d(this,st,{writable:!0,value:void 0}),d(this,nt,{writable:!0,value:void 0}),d(this,ht,{writable:!0,value:void 0}),d(this,lt,{writable:!0,value:void 0}),d(this,at,{writable:!0,value:void 0}),d(this,ot,{writable:!0,value:void 0}),d(this,rt,{writable:!0,value:void 0}),d(this,ct,{writable:!0,value:void 0}),d(this,ut,{writable:!0,value:void 0}),d(this,wt,{writable:!0,value:void 0}),d(this,dt,{writable:!0,value:void 0}),d(this,vt,{writable:!0,value:void 0}),d(this,pt,{writable:!0,value:void 0}),d(this,ft,{writable:!0,value:void 0}),"function"==typeof s&&void 0!==n?(this.object={value:0},e(this,tt,s),e(this,it,{value:1}),this.durationMS=1e3*n):(this.object=s,e(this,it,{}),e(this,tt,null),this.durationMS=1e3),e(this,st,0),e(this,nt,0),e(this,ht,null),e(this,lt,null),e(this,at,null),e(this,ot,!1),e(this,rt,null),e(this,ct,null),e(this,ut,null),e(this,wt,null),e(this,dt,null),e(this,vt,0),e(this,pt,{}),e(this,et,[]),e(this,ft,null),this.easingFunction=t=>t,this.value=0,this.delayTime=0,this.isPlaying=!1,this.startTime=null,Object.keys(this.object).forEach((t=>{i(this,pt)[t]=this.object[t]}))}from(t){return Object.keys(t).forEach((i=>{this.object[i]=t[i]})),null!==i(this,tt)&&i(this,tt).call(this,this.object,this.value,0),this}to(t,s){return void 0!==s&&(this.durationMS=1e3*s),e(this,it,t),i(this,et).length=0,this}duration(t){return this.durationMS=1e3*t,this}rewind(){return Object.keys(this.object).forEach((t=>{this.object[t]=i(this,pt)[t]})),this.value=this.easingFunction(0),this}restart(){return this.rewind().start()}loop(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:1/0;return e(this,st,t),e(this,nt,t),this}startTween(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:D.getTime();const s=this.isPlaying;return e(this,vt,0),e(this,ot,!1),this.isPlaying=!0,this.startTime=t+this.delayTime,0===i(this,et).length&&Object.keys(i(this,it)).forEach((t=>{i(this,pt)[t]=this.object[t],i(this,et).push(t,i(this,it)[t])})),0===this.durationMS&&0===i(this,st)&&0===this.delayTime?(this.update(t),this.isPlaying=!1):s||(F.add(this),D.play()),this}start(){for(var t=arguments.length,s=new Array(t),n=0;n<t;n++)s[n]=arguments[n];const h=i(this,lt);return new Promise((t=>{e(this,lt,(()=>{h&&h(),t(this)})),this.startTween(...s)}))}stop(){return this.isPlaying?(this.isPlaying=!1,F.remove(this),this):this}delay(t){return this.delayTime=1e3*t,this}easing(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:t=>t,{iterations:i=F.bezierIterations,cacheSize:e=F.bezierCacheSize}=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},s=t;return s?("string"==typeof s&&(s=F.getEasingFromCache(s),i&&s.setIterations(i),e&&s.setCacheSize(e)),s.get?this.easingFunction=s.get.bind(s):this.easingFunction=s,this):this}onStart(t){return e(this,at,t),this}onUpdate(t){return e(this,tt,t),this}onComplete(){return e(this,lt,arguments.length>0&&void 0!==arguments[0]?arguments[0]:null),this}onTimelineIn(t){return e(this,rt,t),this}onTimelineOut(t){return e(this,ct,t),this}onTimelineVisible(t){return e(this,ut,t),this}onTimelineInvisible(t){return e(this,wt,t),this}updateAllValues(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0;if(this.value!==i(this,ft)){for(let t=0;t<i(this,et).length;t+=2)u(this,gt,yt).call(this,i(this,et)[t],i(this,et)[t+1]);null!==i(this,tt)&&i(this,tt).call(this,this.object,this.value,t),e(this,ft,this.value)}}invalidate(){return e(this,ft,null),this}update(t){if(t<this.startTime)return!0;!1===i(this,ot)&&(null!==i(this,at)&&i(this,at).call(this,this.object),e(this,ot,!0),D.trigger()),e(this,vt,t-this.startTime);const s=0===this.durationMS?1:Math.min(i(this,vt)/this.durationMS,1);this.value=this.easingFunction(s),null===i(this,dt)&&e(this,dt,t);const n=t-i(this,dt);if(e(this,dt,t),this.updateAllValues(n),1===s){const s=this.startTime;var h;return i(this,nt)>0?(i(this,ht)&&i(this,ht).call(this,this.object,i(this,st)-i(this,nt)),e(this,nt,(h=i(this,nt),--h)),this.restart()):i(this,lt)&&this.isPlaying&&i(this,lt).call(this,this.object,t-this.startTime),this.isPlaying=!(s===this.startTime),!1}return!0}}function yt(t,e){const s=i(this,pt)[t];this.object[t]=s+(e-s)*this.value}class Tt{constructor(){let{delay:i=0}=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};t(this,"previousPosition",null),t(this,"delay",null),this.previousPosition=0,this.delay=i}static setTweenIn(t,i){t.timelineIn=i,t.timelineIn!==t.previousTimelineIn&&(i&&t.onTimelineIn?t.onTimelineIn(t.object):!i&&t.onTimelineOut&&t.onTimelineOut(t.object),t.previousTimelineIn=t.timelineIn)}static setTweenVisibility(t,i){t.timelineVisible=i,t.timelineVisible!==t.previousTimelineVisible&&(i&&t.onTimelineVisible?t.onTimelineVisible(t.object):!i&&t.onTimelineInvisible&&t.onTimelineInvisible(t.object),t.previousTimelineVisible=t.timelineVisible)}}function kt(t,i){let e=arguments.length>2&&void 0!==arguments[2]?arguments[2]:Number.MAX_VALUE;return t<i?i:t>e?e:t}class Mt extends Tt{constructor(t,i){super(i),this.tweens=t.reduce(((t,i,e)=>this.addTween(t,i,0===e?this.delay:0)),[]),this.totalTime=this.tweens.reduce(((t,i)=>t+i.delayTime+i.durationMS),0)}addTween(t,i){let e=arguments.length>2&&void 0!==arguments[2]?arguments[2]:0;if(i instanceof this.constructor)for(let e=0;e<i.tweens.length;e++){const s=i.tweens[e];this.addTween(t,s,0===e?i.delay:0)}else e&&(i.delayTime+=1e3*e),t.push(i);return t}setPosition(t){const i=kt(t,0,1)*this.totalTime;let e=this.totalTime;for(let t=this.tweens.length-1;t>=0;t--){const s=this.tweens[t],n=s.durationMS;if(e-=s.delayTime+n,!(e+s.delayTime>i))break;s.value=0,Mt.setTweenVisibility(s,!1),Mt.setTweenIn(s,!1),s.invalidate(),s.updateAllValues()}e=0;for(let t=0;t<this.tweens.length;t++){const s=this.tweens[t],n=s.durationMS,h=s.delayTime+n,l=e+s.delayTime;if(e+=h,e<=i)s.value=1,Mt.setTweenVisibility(s,!0),Mt.setTweenIn(s,!1);else{if(!(l<=i))break;{const t=kt((i-l)/n,0,1);s.value=s.easingFunction(t),Mt.setTweenVisibility(s,!0),Mt.setTweenIn(s,!0)}}s.invalidate(),s.updateAllValues()}}update(){this.setPosition(this.previousPosition||0)}async start(){this.tweens.forEach((t=>t.start()))}}class Wt extends Tt{constructor(t,i){super(i),this.tweens=t.reduce(((t,i)=>this.addTween(t,i,this.delay)),[]).sort(((t,i)=>t.delayTime-i.delayTime)),this.totalTime=this.tweens.reduce(((t,i)=>Math.max(t,i.delayTime+i.durationMS)),0)}addTween(t,i){let e=arguments.length>2&&void 0!==arguments[2]?arguments[2]:0;return i instanceof this.constructor?i.tweens.forEach((s=>this.addTween(t,s,e+i.delay))):(e&&(i.delayTime+=1e3*e),t.push(i)),t}setPosition(t){const i=kt(t,0,1)*this.totalTime;for(let t=this.tweens.length-1;t>=0;t--){const e=this.tweens[t];if(!(e.delayTime>i))break;e.value=0,Wt.setTweenVisibility(e,!1),Wt.setTweenIn(e,!1),e.invalidate(),e.updateAllValues()}for(let t=0;t<this.tweens.length;t++){const e=this.tweens[t],s=e.durationMS,n=e.delayTime+s,h=e.delayTime;if(n<=i)e.value=1,Wt.setTweenVisibility(e,!0),Wt.setTweenIn(e,!1);else{if(!(h<=i))break;{const t=kt((i-h)/s,0,1);e.value=e.easingFunction(t),Wt.setTweenVisibility(e,!0),Wt.setTweenIn(e,!0)}}e.invalidate(),e.updateAllValues()}this.previousPosition=t}update(){this.setPosition(this.previousPosition||0)}async start(){await Promise.all(this.tweens.map((t=>t.start())))}}let It=!1;try{const t=Object.defineProperty({},"passive",{get:()=>(It=!0,!0)});window.addEventListener("a",null,t),window.removeEventListener("a",null,t)}catch(t){}var St=new WeakMap,xt=new WeakMap,Ot=new WeakMap,Pt=new WeakMap,Et=new WeakMap,jt=new WeakMap,Vt=new WeakMap,Ft=new WeakMap,At=new WeakMap,zt=new WeakMap,Lt=new WeakMap,Ct=new WeakMap,Ht=new WeakMap,Bt=new WeakMap,Dt=new WeakMap,Rt=new WeakMap,Ut=new WeakMap,Nt=new WeakMap,Yt=new WeakMap,$t=new WeakMap,_t=new WeakMap,qt=new WeakMap,Xt=new WeakMap,Gt=new WeakMap,Jt=new WeakMap,Kt=new WeakMap,Qt=new WeakMap,Zt=new WeakSet,ti=new WeakSet,ii=new WeakSet,ei=new WeakSet;class si{constructor(){let{container:s=window.document.body,content:n=window.document.body,scrollFactor:h=1,listener:l=window,debug:a=!1,onResize:o}=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};v(this,ei),v(this,ii),v(this,ti),v(this,Zt),t(this,"isDown",!1),t(this,"isLocked",!1),t(this,"scroll",0),t(this,"scrollHeight",0),d(this,St,{writable:!0,value:.01}),d(this,xt,{writable:!0,value:1}),d(this,Ot,{writable:!0,value:0}),d(this,Pt,{writable:!0,value:0}),d(this,Et,{writable:!0,value:0}),d(this,jt,{writable:!0,value:[]}),d(this,Vt,{writable:!0,value:null}),d(this,Ft,{writable:!0,value:null}),d(this,At,{writable:!0,value:null}),d(this,zt,{writable:!0,value:!1}),d(this,Lt,{writable:!0,value:0}),d(this,Ct,{writable:!0,value:0}),d(this,Ht,{writable:!0,value:null}),d(this,Bt,{writable:!0,value:null}),d(this,Dt,{writable:!0,value:null}),d(this,Rt,{writable:!0,value:null}),d(this,Ut,{writable:!0,value:!0}),d(this,Nt,{writable:!0,value:!1}),d(this,Yt,{writable:!0,value:!1}),d(this,$t,{writable:!0,value:(new mt).easing("0.35,0.15,0,1").onUpdate((t=>{window.scrollTo(0,t.y),e(this,zt,!0),this.scroll=t.y,e(this,Ot,t.y),this.isDown=i(this,Ot)>=i(this,Pt),e(this,Pt,i(this,Ot))})).onStart((()=>{e(this,Yt,!0)})).onComplete((()=>{e(this,Yt,!1)}))}),d(this,_t,{writable:!0,value:!!It&&{passive:!0}}),d(this,qt,{writable:!0,value:null}),d(this,Xt,{writable:!0,value:null}),d(this,Gt,{writable:!0,value:null}),d(this,Jt,{writable:!0,value:null}),d(this,Kt,{writable:!0,value:null}),d(this,Qt,{writable:!0,value:null}),e(this,qt,h),e(this,Xt,s),e(this,Gt,n),e(this,Jt,l),e(this,Kt,a),e(this,Qt,o),e(this,Ht,(()=>{this.isLocked||e(this,Nt,!0)})),e(this,Bt,(()=>{this.isLocked||(e(this,zt,!0),e(this,Ot,kt(this.getScrollPosition(),0,Math.round(this.scrollHeight-i(this,Et)))))})),e(this,Rt,(t=>{t.stopPropagation(),this.isLocked||e(this,Nt,!1)})),e(this,Dt,(()=>{this.isLocked||(i(this,$t)&&i(this,$t).stop(),e(this,Nt,!1),e(this,Yt,!1))})),i(this,Jt)&&(i(this,Kt),i(this,Jt).addEventListener("touchstart",i(this,Ht),i(this,_t)),i(this,Jt).addEventListener("scroll",i(this,Bt),i(this,_t)),i(this,Jt).addEventListener("mousedown",i(this,Rt),i(this,_t)),i(this,Jt).addEventListener("wheel",i(this,Dt),i(this,_t))),i(this,Kt)&&(e(this,Ft,window.document.createElement("canvas")),i(this,Xt).appendChild(i(this,Ft))),D.add(this,u(this,Zt,ni)),D.play(),this.resize()}draw(){u(this,ti,hi).call(this)}drawAll(){const t=i(this,Vt);e(this,Vt,i(this,jt)),u(this,ti,hi).call(this),e(this,Vt,t)}getScrollPosition(){return void 0!==i(this,Jt).scrollY?i(this,Jt).scrollY:void 0!==i(this,Jt).pageYOffset?i(this,Jt).pageYOffset:void 0!==i(this,Jt).scrollTop?i(this,Jt).scrollTop:0}resize(){i(this,Xt)&&i(this,Gt)&&(this.scroll=e(this,Pt,i(this,Ot)),this.scrollHeight=i(this,Gt).scrollHeight,e(this,Et,window.innerHeight),i(this,jt).forEach((t=>{u(this,ei,ai).call(this,t)})),i(this,Ft)&&(i(this,Ft).width=window.innerWidth*window.devicePixelRatio,i(this,Ft).height=window.innerHeight*window.devicePixelRatio,i(this,Ft).style.position="fixed",i(this,Ft).style.left=0,i(this,Ft).style.top=0,i(this,Ft).style.width=`${window.innerWidth}px`,i(this,Ft).style.height=`${window.innerHeight}px`,i(this,Ft).style.pointerEvents="none",i(this,Ft).style.zIndex=9999999,e(this,At,i(this,Ft).getContext("2d"))),i(this,Qt)&&i(this,Qt).call(this),u(this,ii,li).call(this))}triggerAnimations(){let t=arguments.length>0&&void 0!==arguments[0]&&arguments[0];const e=window.devicePixelRatio;i(this,At)&&(i(this,At).clearRect(0,0,i(this,Ft).width,i(this,Ft).height),i(this,At).strokeStyle="#f00",i(this,At).lineWidth=2*e,i(this,At).beginPath()),i(this,t?jt:Vt).forEach((t=>{const s=t.box;if(!s||!s.width||!s.height)return;const n=t.animationObject;n.scroll=this.scroll;const h=t.directionOffset||0,l=t.offset||0,a=s.top+s.height-n.scroll+h*(this.isDown?-1:1)*i(this,Et)+l*i(this,Et),o=a/(i(this,Et)+s.height),r=(a-i(this,Et))/s.height;n.rawFactor=(1-o-.5)*t.speed+.5,n.rawBoxFactor=(1-r-.5)*t.speed+.5,n.factor=kt(n.rawFactor,0,1),n.isInView=n.rawFactor>=0&&n.rawFactor<=1,n.boxFactor=kt(n.rawBoxFactor,0,1),n.boxIsInView=n.rawBoxFactor>=0&&n.rawBoxFactor<=1,n.box=s,n.item=t.item,n.fixedTop&&(n.box.top=n.fixedTop),n.isInView!==n.previousIsInView&&(n.isInView?(n.isScrolledIn=!0,void 0===n.isScrolledInOnce&&(n.isScrolledInOnce=!0)):void 0!==n.previousIsInView&&(n.isScrolledOut=!0,void 0===n.isScrolledOutOnce&&(n.isScrolledOutOnce=!0))),t.animation&&t.previousFactor!==n.factor&&(t.animation(n),t.previousFactor=n.factor),n.isScrolledIn=!1,n.isScrolledOut=!1,!0===n.isScrolledInOnce&&(n.isScrolledInOnce=!1),!0===n.isScrolledOutOnce&&(n.isScrolledOutOnce=!1),n.previousIsInView=n.isInView,i(this,At)&&n.box.top+n.box.height-n.scroll>=0&&n.box.top-n.scroll<=i(this,Et)&&i(this,At).rect(n.box.left*e,n.box.top*e-n.scroll*e,n.box.width*e,n.box.height*e)})),i(this,At)&&i(this,At).stroke()}add(t,s){let n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};const h=t&&t instanceof Array?t:[t];void 0===n.observeIn&&(n.observeIn=null),h.forEach((t=>{const h={centerOffset:0,originalTop:0,isVisible:!0};let l=null;window.IntersectionObserver&&void 0!==n.observeIn?(l=new window.IntersectionObserver((t=>{t.forEach((t=>{h.isVisible=t.isIntersecting,u(this,ii,li).call(this)}))}),{root:n.observeIn,rootMargin:`${n.directionOffset?100*n.directionOffset:n.speed?1/n.speed*100:0}% 0% ${n.directionOffset?100*n.directionOffset:n.offset?100*n.offset:n.speed?1/n.speed*100:0}% 0%`,threshold:0}),l.observe(t)):e(this,Vt,null);const a={animation:s,directionOffset:n.directionOffset||0,offset:n.offset||0,speed:void 0===n.speed?1:n.speed,animationObject:h,item:t,observer:l};u(this,ei,ai).call(this,a),i(this,jt).push(a)}))}remove(t){const s=t&&t instanceof Array?t:[t];e(this,jt,i(this,jt).filter((t=>s.indexOf(t.item)<0)))}static getBox(t){let i=t,e=0,s=0;do{if(void 0===i.offsetLeft){const t=i.getBoundingClientRect(),n=window.document.documentElement;e+=t.left+window.pageXOffset-n.clientLeft,s+=t.top+window.pageYOffset-n.clientTop}else e+=i.offsetLeft,s+=i.offsetTop;i=i.offsetParent}while(i);if(void 0===t.offsetWidth){const i=t.getBoundingClientRect();return{left:e,top:s,width:i.width,height:i.height}}return{left:e,top:s,width:t.offsetWidth,height:t.offsetHeight}}scrollTo(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;return i(this,$t).from({y:this.scroll}).to({y:t},e??kt(25e-5*Math.abs(t-this.scroll),.25,2.5)).start()}scrollToElement(t){let i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,e=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null;const s=si.getBox(t);return this.scrollTo(s.top,i,e)}reset(){i(this,jt).length=0,e(this,Et,0)}stop(){e(this,zt,!1)}lock(){this.isLocked=!0}unlock(){this.isLocked=!1,window.scrollTo(0,this.scroll)}setContent(t){e(this,Gt,t),this.resize()}unsetContent(){e(this,Gt,null)}destroy(){i(this,Kt)&&i(this,Ft).remove(),i(this,Jt)&&(i(this,Kt),i(this,Jt).removeEventListener("touchstart",i(this,Ht),i(this,_t)),i(this,Jt).removeEventListener("wheel",i(this,Dt),i(this,_t)),i(this,Jt).removeEventListener("mousedown",i(this,Rt),i(this,_t)),i(this,Jt).removeEventListener("scroll",i(this,Bt),i(this,_t))),this.reset(),this.stop()}}function ni(){if(this.isLocked)return!0;if(this.scrollHeight=i(this,Gt)?i(this,Gt).scrollHeight:0,this.scrollHeight!==i(this,Ct))return this.resize(),this.scroll=i(this,Ot),u(this,ti,hi).call(this,this.scroll),e(this,Ct,this.scrollHeight),!0;if(!i(this,zt))return!0;const t=(i(this,Ot)-this.scroll)*(i(this,Nt)?i(this,xt):i(this,qt));if(Math.abs(t)<i(this,St)&&(i(this,Nt)&&this.triggerAnimations(!0),e(this,zt,!1)),this.scroll+=t,i(this,Ut)){e(this,Ut,!1),this.scroll=i(this,Ot),i(this,Kt);const t=this.isDown;this.isDown=!0,this.triggerAnimations(!0),this.isDown=!1,this.triggerAnimations(!0),this.isDown=t}return null===i(this,Vt)&&e(this,Vt,i(this,jt)),u(this,ti,hi).call(this,this.scroll),!0}function hi(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0;this.isDown=t>=i(this,Pt),i(this,Vt)&&(this.triggerAnimations(),e(this,Pt,t))}function li(){e(this,Vt,i(this,jt).filter((t=>t.animationObject.isVisible))),i(this,Kt)}function ai(t){t.box=si.getBox(t.item),t.animationObject.centerOffset=.5*(i(this,Et)-t.box.height),t.animationObject.originalTop=t.box.top,t.animationObject.scroll=t.animationObject.targetScroll=i(this,Ot)}
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
*/const oi=mt;exports.RenderLoop=D,exports.SmoothScroller=si,exports.Timeline=Wt,exports.Tween=oi,exports.TweenChain=Mt,exports.TweenManager=F,exports.delay=async t=>new mt((()=>!0),0).delay(t).start();
