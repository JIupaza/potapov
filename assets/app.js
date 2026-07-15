/* Никита Потапов — интерактив: reveal, шапка, дышащий круг */
(function(){
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- шапка: прозрачная на тиле, плотная на песке --- */
  var nav = document.querySelector('.nav');
  var hero = document.querySelector('.hero');
  function navState(){
    var past = hero ? (window.scrollY > hero.offsetHeight - 80) : (window.scrollY > 40);
    nav.classList.toggle('solid', past);
  }
  navState();
  window.addEventListener('scroll', navState, {passive:true});

  /* --- каскад в герое: элементы всплывают по очереди --- */
  document.querySelectorAll('.hero [data-reveal]').forEach(function(el, i){
    el.style.transitionDelay = (0.25 + i * 0.14) + 's';
  });

  /* --- reveal при скролле --- */
  var items = document.querySelectorAll('[data-reveal]');
  if (reduced || !('IntersectionObserver' in window)) {
    items.forEach(function(el){ el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, {threshold:.12, rootMargin:'0px 0px -8% 0px'});
    items.forEach(function(el){ io.observe(el); });
  }

  /* --- линия опоры: терракотовая нить растёт со скроллом --- */
  var supportFill = document.getElementById('supportFill');
  /* --- параллакс полос-картинок --- */
  var strips = Array.prototype.slice.call(document.querySelectorAll('.strip img'));
  var ticking = false;
  function paintScroll(){
    ticking = false;
    if (supportFill) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      supportFill.style.height = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
    }
    if (!reduced) {
      strips.forEach(function(img){
        var r = img.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        /* -1..1: положение центра полосы относительно центра экрана */
        var k = ((r.top + r.height / 2) - window.innerHeight / 2) / (window.innerHeight / 2 + r.height / 2);
        img.style.transform = 'scale(1.08) translateY(' + (k * -4) + '%)';
      });
    }
    ticking = false;
  }
  function onScroll(){
    if (!ticking) { ticking = true; requestAnimationFrame(paintScroll); }
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onScroll, {passive:true});
  paintScroll();

  /* --- дышащий круг: вдох 4с — выдох 6с --- */
  var circle = document.getElementById('breathCircle');
  var label  = document.getElementById('breathLabel');
  if (circle && label && !reduced) {
    var running = false;
    function phase(name, scale, dur, next){
      label.textContent = name;
      circle.style.transitionDuration = dur + 'ms';
      circle.style.transform = 'scale(' + scale + ')';
      setTimeout(next, dur);
    }
    function cycle(){
      if (!running) return;
      phase('вдох', 1.08, 4000, function(){
        if (!running) return;
        phase('выдох', 0.78, 6000, cycle);
      });
    }
    /* запускаем, только когда круг на экране — не жжём ресурсы зря */
    var bio = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting && !running) { running = true; cycle(); }
        else if (!e.isIntersecting) { running = false; }
      });
    }, {threshold:.35});
    bio.observe(circle);
  } else if (label) {
    label.textContent = 'выдох';
  }
})();
