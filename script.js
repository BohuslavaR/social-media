/**
 * Social content portfolio — progressive enhancements.
 * Navigation and all nine sections remain available without JavaScript.
 */
(() => {
  "use strict";

  function initializePortfolio() {
    // Reveal the floating disclosure only after the compact opening has passed.
    const navigation = document.querySelector(".floating-nav");
    const toggle = document.querySelector(".menu-orb");
    const menu = document.getElementById("section-menu");
    const overview = document.getElementById("explore");
    if (navigation && toggle && menu && overview) {
      const setMenuOpen = (open) => {
        menu.hidden = !open;
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Close section navigation" : "Open section navigation");
      };
      toggle.addEventListener("click", () => setMenuOpen(menu.hidden));
      menu.addEventListener("click", (event) => {
        if (event.target.closest("a")) setMenuOpen(false);
      });
      document.addEventListener("pointerdown", (event) => {
        if (!navigation.contains(event.target)) setMenuOpen(false);
      });
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !menu.hidden) {
          setMenuOpen(false);
          toggle.focus();
        }
      });
      const links = [...menu.querySelectorAll("a")];
      const sections = [...document.querySelectorAll(".detail-section, .feature-section")];
      let scheduled = false;
      const updateNavigation = () => {
        scheduled = false;
        navigation.hidden = overview.getBoundingClientRect().bottom > 80;
        if (navigation.hidden) setMenuOpen(false);
        let current = "hero";
        sections.forEach((section) => {
          if (section.getBoundingClientRect().top < window.innerHeight * 0.5) current = section.id;
        });
        links.forEach((link) => {
          if (link.getAttribute("href") === "#" + current) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      };
      const scheduleUpdate = () => {
        if (scheduled) return;
        scheduled = true;
        window.requestAnimationFrame(updateNavigation);
      };
      window.addEventListener("scroll", scheduleUpdate, { passive: true });
      window.addEventListener("resize", scheduleUpdate);
      updateNavigation();
    }

    // Rotate twelve beauty and vegan-ingredient slogans every five seconds.
    // Pause background tabs so returning visitors always have time to read.
    const rotator = document.querySelector("[data-slogan-rotator]");
    if (rotator) {
      const slogans = [...rotator.querySelectorAll("[data-slogan]")];
      const pauseButton = rotator.querySelector(".slogan-toggle");
      let activeIndex = 0;
      let paused = false;
      let intervalId = null;
      const stopRotation = () => {
        window.clearInterval(intervalId);
        intervalId = null;
      };
      const startRotation = () => {
        stopRotation();
        if (paused || document.hidden || slogans.length < 2) return;
        intervalId = window.setInterval(() => {
          slogans[activeIndex].setAttribute("aria-hidden", "true");
          activeIndex = (activeIndex + 1) % slogans.length;
          slogans[activeIndex].setAttribute("aria-hidden", "false");
        }, 5000);
      };
      if (pauseButton && slogans.length > 1) {
        pauseButton.hidden = false;
        pauseButton.addEventListener("click", () => {
          paused = !paused;
          pauseButton.setAttribute("aria-pressed", String(paused));
          pauseButton.textContent = paused ? "Resume slogans" : "Pause slogans";
          startRotation();
        });
      }
      document.addEventListener("visibilitychange", startRotation);
      startRotation();
    }

    // Keep the copyright year current without a manual annual edit.
    const year = document.querySelector("[data-year]");
    if (year) year.textContent = String(new Date().getFullYear());

    // Move keyboard focus to the destination after native hash navigation.
    // Native anchors retain browser history, deep linking and reduced-motion CSS.
    const focusDestination = () => {
      const id = window.location.hash.slice(1);
      const destination = document.getElementById(id);
      if (destination && destination.matches(".detail-section, .feature-section")) {
        destination.focus({ preventScroll: true });
      }
    };

    window.addEventListener("hashchange", focusDestination);
    focusDestination();

    // Touch: first tap reveals the description; the second follows the link.
    // Mouse and keyboard users retain standard single-click / Enter navigation.
    const tiles = [...document.querySelectorAll(".tile")];
    let touchTile = null;
    const closeCallouts = () => {
      tiles.forEach((tile) => {
        tile.classList.remove("is-open");
        tile.classList.add("is-dismissed");
      });
    };

    tiles.forEach((tile) => {
      tile.addEventListener("pointerdown", (event) => {
        touchTile = event.pointerType === "touch" ? tile : null;
      });
      // Explicit state also supports styles driven by the .is-open class.
      tile.addEventListener("pointerenter", (event) => {
        if (event.pointerType === "touch") return;
        closeCallouts();
        tile.classList.remove("is-dismissed");
        tile.classList.add("is-open");
      });
      tile.addEventListener("pointerleave", (event) => {
        if (event.pointerType !== "touch") tile.classList.remove("is-open");
      });
      tile.addEventListener("focus", () => {
        closeCallouts();
        tile.classList.remove("is-dismissed");
      });
      tile.addEventListener("click", (event) => {
        if (touchTile === tile && !tile.classList.contains("is-open")) {
          event.preventDefault();
          closeCallouts();
          tile.classList.remove("is-dismissed");
          tile.classList.add("is-open");
        } else {
          closeCallouts();
        }
        touchTile = null;
      });
    });

    // Escape dismisses hover/focus content without moving the user's focus.
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      closeCallouts();
      tiles.forEach((tile) => tile.classList.add("is-dismissed"));
    });
    document.addEventListener("pointerdown", (event) => {
      if (!event.target.closest(".tile")) closeCallouts();
    });
  }

  // Initialize safely whether the script is in the head, deferred, or injected
  // after the document has loaded. DOM queries must not run before tiles exist.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializePortfolio, { once: true });
  } else {
    initializePortfolio();
  }
})();

// Native scrolling supports touch and remains usable without JavaScript.
(() => {
  function initCarousels() {
    document.querySelectorAll('[data-carousel]').forEach(root => {
      const track=root.querySelector('.carousel-track');
      const slides=[...root.querySelectorAll('.carousel-slide')];
      const dots=[...root.querySelectorAll('[data-slide]')];
      const status=root.querySelector('.carousel-status');
      let current=0, frame=0;
      const announce=()=>{ dots.forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===current))); status.textContent=`${current+1} / ${slides.length}`; };
      const go=index=>{ current=(index+slides.length)%slides.length; track.scrollTo({left:current*track.clientWidth,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}); announce(); };
      root.querySelector('.carousel-controls').hidden=false;
      root.querySelector('[data-prev]')?.addEventListener('click',()=>go(current-1));
      root.querySelector('[data-next]')?.addEventListener('click',()=>go(current+1));
      dots.forEach((dot,i)=>dot.addEventListener('click',()=>go(i)));
      track.addEventListener('keydown',event=>{ if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();go(current+(event.key==='ArrowRight'?1:-1));} });
      track.addEventListener('scroll',()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{current=Math.round(track.scrollLeft/track.clientWidth);announce();});},{passive:true});
      new ResizeObserver(()=>{track.scrollTo({left:current*track.clientWidth,behavior:'instant'});}).observe(track);
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initCarousels,{once:true});else initCarousels();
})();

(() => {
  function initMotion() {
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    document.querySelectorAll('.read-more').forEach(details=>{
      const content=details.querySelector('.read-more-content');
      let animations=[];
      details.addEventListener('toggle',()=>{
        animations.forEach(a=>a.cancel()); animations=[];
        if(!details.open || reduced.matches || !content.animate)return;
        const height=content.getBoundingClientRect().height;
        animations.push(content.animate([
          {height:'0px',opacity:0,overflow:'hidden'},
          {height:height+'px',opacity:1,overflow:'hidden'}
        ],{duration:650,easing:'cubic-bezier(.22,.61,.36,1)'}));
        [...content.children].forEach((part,i)=>animations.push(part.animate([
          {opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}
        ],{duration:450,delay:100+i*120,fill:'backwards',easing:'ease-out'})));
      });
    });
    // Word groups preserve wrapping and deliberate line breaks in the title.
    const headings=[...document.querySelectorAll('.detail-section h2,.feature-section h2')];
    headings.forEach(heading=>{
      heading.setAttribute('aria-label',heading.innerText.replace(/\s+/g,' ').trim());
      let index=0;
      [...heading.childNodes].forEach(node=>{
        if(node.nodeType!==Node.TEXT_NODE)return;
        const fragment=document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(word=>{
          if(!word.trim()){fragment.append(document.createTextNode(word));return;}
          const span=document.createElement('span');span.className='heading-word';
          span.textContent=word;span.setAttribute('aria-hidden','true');span.style.setProperty('--word-index',index++);fragment.append(span);
        });node.replaceWith(fragment);
      });
    });
    if('IntersectionObserver' in window){
      const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
        entry.target.classList.toggle('heading-bounce',entry.isIntersecting && !reduced.matches);
      }),{threshold:.5,rootMargin:'0px 0px -12% 0px'});
      headings.forEach(h=>observer.observe(h));
    }
    const root=document.querySelector('[data-scheduled-post]');
    if(root){
      const images=[...root.querySelectorAll('.scheduled-images img')];
      const clock=root.querySelector('[data-countdown]'),bar=root.querySelector('.post-progress span');
      let active=0,elapsed=0,last=performance.now(),visible=true;
      if('IntersectionObserver' in window)new IntersectionObserver(entries=>{
        visible=entries[0].isIntersecting;last=performance.now();
      }).observe(root);
      // Seven seconds of visible time per post; no manual slide selectors.
      window.setInterval(()=>{
        const now=performance.now();
        if(visible && !document.hidden){
          elapsed+=now-last;
          if(elapsed>=7000){
            elapsed%=7000;active=(active+1)%images.length;
            images.forEach((img,i)=>{img.classList.toggle('is-current',i===active);img.setAttribute('aria-hidden',String(i!==active));});
          }
          clock.textContent='00:'+String(Math.ceil((7000-elapsed)/1000)).padStart(2,'0');
          bar.style.transform=`scaleX(${elapsed/7000})`;
        }
        last=now;
      },100);
      document.addEventListener('visibilitychange',()=>{last=performance.now();});
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initMotion,{once:true});else initMotion();
})();

(() => {
  function initStorySquare(){
    const square=document.querySelector('[data-story-square]');
    if(!square)return;
    const frames=[...square.querySelectorAll('.story-frame')];
    if(!frames.length)return;
    const palette=['#fffdfa','#fff4c9','#ffe69a','#e7d3b0','#fff4c9','#fffdfa'];
    let step=0,elapsed=0,last=performance.now(),visible=true;
    if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;last=performance.now();}).observe(square);
    window.setInterval(()=>{
      const now=performance.now();
      if(visible&&!document.hidden){
        elapsed+=now-last;
        if(elapsed>=3000){
          elapsed%=3000;step++;
          square.style.backgroundColor=palette[step%palette.length];
          frames.forEach((frame,i)=>{const active=i===step%frames.length;frame.classList.toggle('is-current',active);frame.setAttribute('aria-hidden',String(!active));});
        }
      }
      last=now;
    },100);
    document.addEventListener('visibilitychange',()=>{last=performance.now();});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initStorySquare,{once:true});else initStorySquare();
})();

// Always-available return to the opening section. Native hash remains a fallback.
(() => {
  function initBackToTop(){
    const link=document.querySelector('.back-to-top');
    if(!link)return;
    link.addEventListener('click',event=>{
      event.preventDefault();
      window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
      const hero=document.getElementById('hero');
      if(hero){hero.setAttribute('tabindex','-1');hero.focus({preventScroll:true});}
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initBackToTop,{once:true});else initBackToTop();
})();
