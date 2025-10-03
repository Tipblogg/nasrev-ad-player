// public/loader.js
(function () {
    "use strict";
    console.log("NasRev Loader Initialized");

    const signals = {
        title: document.title || "",
        url: location.href
    };

    if (!document.querySelector('[data-vast]')) {
        console.log("NasRev: No [data-vast] container found. Aborting.");
        return;
    }

    fetch('/predict-yield', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signals)
    })
        .then(res => res.json())
        .then(decision => {
            if (decision && decision.action === 'load_player') {
                console.log(`NasRev Decision: Load player (Predicted eCPM: $${decision.eCPM})`);
                loadScript('/player.js');
            } else {
                console.log(`NasRev Decision: Fallback. Player will not load. (Predicted eCPM: $${decision.eCPM})`);
            }
        })
        .catch(err => {
            console.warn("NasRev prediction failed, loading player as a fallback.", err);
            loadScript('/player.js'); // Decide if you want to load on error or not
        });

    function loadScript(src) {
        if (document.querySelector(`script[src="${src}"]`)) return;
        const s = document.createElement("script");
        s.src = src;
        s.async = true;
        document.head.appendChild(s);
    }
})();