// public/player.js
(function () {
    "use strict";

    // --- UTILITY FUNCTIONS ---
    function domReady(fn) { if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", fn, { once: true }); } else { fn(); } }
    const qs = (sel, root = document) => root.querySelector(sel);
    const enc = encodeURIComponent;
    function loadImaSdk(src) {
        return new Promise((resolve, reject) => {
            const s = document.createElement("script");
            s.src = src; s.async = true; s.onload = resolve; s.onerror = reject;
            document.head.appendChild(s);
        });
    }

    // --- FEATURE: DYNAMIC BACKGROUND ---
    function setDynamicBackground(container) {
        const ogImageEl = document.querySelector('meta[property="og:image"]');
        if (!ogImageEl || !ogImageEl.content) return;

        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = ogImageEl.content;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 1; canvas.height = 1;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, 1, 1);
            const data = ctx.getImageData(0, 0, 1, 1).data;
            const color = `rgb(${data[0]}, ${data[1]}, ${data[2]})`;
            const colorDarker = `rgb(${Math.round(data[0] * 0.8)}, ${Math.round(data[1] * 0.8)}, ${Math.round(data[2] * 0.8)})`;
            container.style.background = `linear-gradient(45deg, ${color}, ${colorDarker})`;
            const bgVideo = container.querySelector('video');
            if (bgVideo) bgVideo.remove();
        };
    }

    // --- MAIN PLAYER LOGIC ---
    domReady(() => {
        const container = document.querySelector("[data-vast]");
        if (!container) { console.warn("NasVideo: no [data-vast] container found"); return; }

        const wrapper = document.createElement('div');
        wrapper.className = 'outstream-wrapper';
        container.parentNode.insertBefore(wrapper, container);
        wrapper.appendChild(container);
        container.classList.add("outstream-container");

        const style = document.createElement("style");
        style.textContent = `
      .outstream-wrapper{position:relative;max-width:640px;margin:20px auto;}
      .outstream-container{position:relative;width:100%;aspect-ratio:16/9;background:#000;border-radius:12px;overflow:hidden;will-change:transform;transform:translateZ(0);}
      .outstream-container video,.outstream-container .ad-layer{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
      .outstream-container.is-floating{position:fixed!important;top:16px;right:16px;left:auto;bottom:auto;width:clamp(220px,40vw,360px);max-width:none!important;height:auto;z-index:9999;box-shadow:0 6px 18px rgba(0,0,0,.45);}
      .nv-badge{position:absolute;top:-8px;right:8px;transform:translateY(-100%);padding:4px 8px;border-radius:6px;background:rgba(0,0,0,.75);color:#fff;font:600 11px/1.2 sans-serif;z-index:1;text-decoration:none;opacity:.9;box-shadow:0 1px 3px rgba(0,0,0,.3);}
      /* ... other styles from previous code ... */
    `;
        document.head.appendChild(style);

        setDynamicBackground(container);

        const videoEl = document.createElement("video");
        videoEl.setAttribute("playsinline", ""); videoEl.muted = true; videoEl.autoplay = true; videoEl.loop = true;
        container.appendChild(videoEl);

        const adLayer = document.createElement("div"); adLayer.className = "ad-layer"; container.appendChild(adLayer);
        const badge = document.createElement("a");
        badge.className = "nv-badge"; badge.href = "https://nasrev.com"; badge.target = "_blank"; badge.innerHTML = `Powered by <span>NASREV</span>`;
        wrapper.appendChild(badge);

        // --- IMA SDK & AD LOGIC ---
        let adDisplayContainer, adsLoader, adsManager;
        let totalTimeInView = 0, viewTimer = null, adIsVisible = false;

        const observer = new IntersectionObserver((entries) => {
            adIsVisible = entries[0].isIntersecting;
            if (viewTimer) { adIsVisible ? startViewTimer() : clearInterval(viewTimer); }
        }, { threshold: 0.5 });

        function startViewTimer() {
            clearInterval(viewTimer);
            viewTimer = setInterval(() => { totalTimeInView += 100; }, 100);
        }

        loadImaSdk("https://imasdk.googleapis.com/js/sdkloader/ima3.js").then(() => {
            // --- ALL THE REST OF THE PLAYER & IMA LOGIC FROM THE PREVIOUS RESPONSE GOES HERE ---
            // This includes:
            // - setupIMA()
            // - buildAdTagUrl()
            // - requestAds()
            // - onAdsManagerLoaded(e) -- MAKE SURE TO MODIFY THIS
            // - onAdError(evt)
            // - Floating logic, controls, etc.

            // --- MODIFICATION FOR onAdsManagerLoaded ---
            function onAdsManagerLoaded(e) {
                adsManager = e.getAdsManager(videoEl);

                adsManager.addEventListener(google.ima.AdEvent.Type.STARTED, () => {
                    totalTimeInView = 0;
                    if (adIsVisible) startViewTimer();
                });

                adsManager.addEventListener(google.ima.AdEvent.Type.ALL_ADS_COMPLETED, () => {
                    clearInterval(viewTimer);
                    viewTimer = null;
                    console.log(`Total Time in View: ${totalTimeInView / 1000}s`);

                    if (navigator.sendBeacon) {
                        navigator.sendBeacon('/analytics', JSON.stringify({ timeInViewMs: totalTimeInView }));
                    }
                });
                // ... rest of onAdsManagerLoaded logic ...
            }

            // --- START EVERYTHING ---
            // setupIMA();
            // requestAds();
            observer.observe(container);

        }).catch(e => console.warn("IMA SDK failed to load:", e));
    });
})();

// NOTE: For brevity, I've stubbed out the full IMA logic. You would copy-paste the
// complete, working player logic from our last conversation into this file.
// The key changes are adding setDynamicBackground and the IntersectionObserver.