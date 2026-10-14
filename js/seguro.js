// Interacción de "Conoce tu seguro" sin React: audio, pestañas y ejemplos de
// lluvia. Lógica equivalente a MCC (frontend/components/Education.tsx y
// frontend/rain-illustration.ts).
(function () {
  'use strict';

  // ---- Audio de la explicación ----
  var boton = document.getElementById('audio-boton');
  var audio = document.getElementById('audio-explicacion');
  var icono = document.getElementById('audio-icono');
  var texto = document.getElementById('audio-texto');

  function estadoAudio(estado) {
    var textos = {
      idle: 'Escuchar explicación',
      playing: 'Pausar explicación',
      paused: 'Continuar explicación',
      unavailable: 'Audio no disponible en este navegador'
    };
    texto.textContent = textos[estado];
    icono.setAttribute('href', estado === 'playing' ? '#i-pause' : '#i-volume-2');
    boton.setAttribute('aria-pressed', estado === 'playing' ? 'true' : 'false');
    boton.disabled = estado === 'unavailable';
  }

  boton.addEventListener('click', function () {
    if (!audio.paused) {
      audio.pause();
      return;
    }
    var intento = audio.play();
    if (intento && intento.catch) intento.catch(function () { estadoAudio('unavailable'); });
  });
  audio.addEventListener('play', function () { estadoAudio('playing'); });
  audio.addEventListener('pause', function () { if (!audio.ended) estadoAudio('paused'); });
  audio.addEventListener('ended', function () { estadoAudio('idle'); });
  audio.addEventListener('error', function () { estadoAudio('unavailable'); });

  // ---- Pestañas exceso / déficit ----
  var pestanas = Array.prototype.slice.call(document.querySelectorAll('.rain-tabs [role=tab]'));

  function activarPestana(seleccionada) {
    pestanas.forEach(function (p) {
      var activa = p === seleccionada;
      p.setAttribute('aria-selected', activa ? 'true' : 'false');
      p.tabIndex = activa ? 0 : -1;
      document.getElementById(p.getAttribute('aria-controls')).hidden = !activa;
    });
  }

  pestanas.forEach(function (p, i) {
    p.addEventListener('click', function () { activarPestana(p); });
    p.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      var siguiente = pestanas[(i + (e.key === 'ArrowRight' ? 1 : pestanas.length - 1)) % pestanas.length];
      activarPestana(siguiente);
      siguiente.focus();
    });
  });

  // ---- Ejemplos de lluvia ----
  var MAX = 200;

  // Escala pedagógica normalizada. No es una regla contractual ni calcula pagos.
  function compensacionIlustrativa(tipo, lluvia) {
    var distancia = tipo === 'excess' ? (lluvia - 120) / 80 : (40 - lluvia) / 40;
    return Math.max(0, Math.min(1, distancia));
  }

  function etiquetaCompensacion(c) {
    if (c === 0) return 'Sin compensación';
    if (c < 0.34) return 'Compensación inicial';
    if (c < 0.67) return 'Compensación intermedia';
    return 'Compensación más alta';
  }

  document.querySelectorAll('.rain-example').forEach(function (ejemplo) {
    var tipo = ejemplo.getAttribute('data-kind');
    var limite = tipo === 'excess' ? 120 : 40;
    var control = ejemplo.querySelector('.rain-slider');
    var parte = function (rol) { return ejemplo.querySelector('[data-rol="' + rol + '"]'); };

    function actualizar() {
      var lluvia = Number(control.value);
      var activo = tipo === 'excess' ? lluvia > limite : lluvia < limite;
      var compensacion = compensacionIlustrativa(tipo, lluvia);
      var etiqueta = etiquetaCompensacion(compensacion);

      control.style.setProperty('--pct', (lluvia / MAX) * 100 + '%');
      control.setAttribute('aria-valuetext', lluvia + ' milímetros');
      parte('valor').textContent = lluvia;
      parte('relleno').style.height = (lluvia / MAX) * 100 + '%';
      parte('grafico').setAttribute('aria-label',
        lluvia + ' milímetros ficticios de lluvia. Nivel de referencia ' + limite + '. ' +
        (activo ? 'Compensación activada en el ejemplo' : 'Sin activación en el ejemplo'));

      parte('estado').classList.toggle('is-active', activo);
      parte('estado-icono').setAttribute('href', activo ? '#i-circle-check-big' : '#i-cloud-rain');
      parte('estado-titulo').textContent = activo ? 'Se activa una compensación' : 'No hay activación';
      parte('estado-detalle').textContent = activo
        ? 'En este ejemplo, la lluvia cruzó el nivel.'
        : 'La lluvia no cruza el nivel de activación del ejemplo.';

      parte('compensacion-texto').textContent = etiqueta;
      parte('medidor').setAttribute('aria-valuenow', Math.round(compensacion * 100));
      parte('medidor').setAttribute('aria-valuetext', etiqueta + ' en el ejemplo ficticio');
      parte('medidor-barra').style.width = compensacion * 100 + '%';
    }

    control.addEventListener('input', actualizar);
    actualizar();
  });
})();
