import e from"./AbstractTimeline.js";import t from"../math/clamp.js";class s extends e{constructor(e,t){super(t),this.tweens=e.reduce(((e,t,s)=>this.addTween(e,t,0===s?this.delay:0)),[]),this.totalTime=this.tweens.reduce(((e,t)=>e+t.delayTime+t.durationMS),0)}addTween(e,t){let s=arguments.length>2&&void 0!==arguments[2]?arguments[2]:0;if(t instanceof this.constructor)for(let s=0;s<t.tweens.length;s++){const i=t.tweens[s];this.addTween(e,i,0===s?t.delay:0)}else s&&(t.delayTime+=1e3*s),e.push(t);return e}setPosition(e){const i=t(e,0,1)*this.totalTime;let n=this.totalTime;for(let e=this.tweens.length-1;e>=0;e--){const t=this.tweens[e],a=t.durationMS;if(n-=t.delayTime+a,!(n+t.delayTime>i))break;t.value=0,s.setTweenVisibility(t,!1),s.setTweenIn(t,!1),t.invalidate(),t.updateAllValues()}n=0;for(let e=0;e<this.tweens.length;e++){const a=this.tweens[e],l=a.durationMS,o=a.delayTime+l,d=n+a.delayTime;if(n+=o,n<=i)a.value=1,s.setTweenVisibility(a,!0),s.setTweenIn(a,!1);else{if(!(d<=i))break;{const e=t((i-d)/l,0,1);a.value=a.easingFunction(e),s.setTweenVisibility(a,!0),s.setTweenIn(a,!0)}}a.invalidate(),a.updateAllValues()}}update(){this.setPosition(this.previousPosition||0)}async start(){this.tweens.forEach((e=>e.start()))}}export{s as default};