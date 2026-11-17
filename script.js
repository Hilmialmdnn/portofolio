(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const WA = document.body.dataset.wa;

  /* Progress bar */
  const bar = $(".progress");
  addEventListener(
    "scroll",
    () => {
      const h = document.documentElement;
      bar.style.width =
        (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100 + "%";
    },
    { passive: true },
  );

  /* Navbar: indikator geser + aktif saat scroll */
  const links = $$("#nav a"),
    pill = $(".pill");
  const movePill = (el) => {
    pill.style.width = el.offsetWidth + "px";
    pill.style.transform = `translateX(${el.offsetLeft - 8}px)`;
  };
  const setActive = (id) => {
    links.forEach((a) => {
      const on = a.getAttribute("href") === "#" + id;
      a.classList.toggle("active", on);
      if (on) movePill(a);
    });
  };
  const secObs = new IntersectionObserver(
    (es) => {
      es.forEach((e) => e.isIntersecting && setActive(e.target.id));
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );
  $$("header[id], section[id]").forEach((s) => secObs.observe(s));
  addEventListener("resize", () => movePill($("#nav a.active")));
  addEventListener("load", () => movePill($("#nav a.active")));

  /* Efek ketik */
  const roles = [
    "Backend Developer Enthusiast",
    "Laravel Developer",
    "Cloud & Security Learner",
  ];
  const t = $("#typed");
  let ri = 0,
    ci = 0,
    del = false;
  (function tick() {
    const w = roles[ri];
    t.textContent = w.slice(0, (ci += del ? -1 : 1));
    let d = del ? 40 : 85;
    if (!del && ci === w.length) {
      del = true;
      d = 1400;
    } else if (del && ci === 0) {
      del = false;
      ri = (ri + 1) % roles.length;
      d = 350;
    }
    setTimeout(tick, d);
  })();

  /* Hero: urutan animasi mengikuti scroll saat hero terkunci */
  const scene = $(".scene");
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const updateHero = () => {
    const p = clamp(scrollY / (scene.offsetHeight - innerHeight));
    const set = (k, v) => scene.style.setProperty(k, v.toFixed(3));
    set("--p", p);
    set("--tr", seg(p, 0, 0.4)); // pohon membesar & hilang
    set("--t1", seg(p, 0.4, 0.6) * (1 - seg(p, 0.85, 1))); // tulisan muncul, lalu hilang sebelum foto terlepas
  };
  addEventListener("scroll", updateHero, { passive: true });
  updateHero();

  /* Reveal saat scroll */
  const rev = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          rev.unobserve(e.target);
        }
      }),
    { threshold: 0.15 },
  );
  $$(".reveal").forEach((el) => rev.observe(el));

  /* Counter kartu folder (dihitung otomatis dari jumlah kartu portofolio) */
  $$("[data-count]").forEach((el) => {
    const target = $$(`.item[data-group="${el.dataset.count}"]`).length;
    const co = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      let n = 0;
      const id = setInterval(() => {
        el.textContent = ++n;
        if (n >= target) clearInterval(id);
      }, 220);
      co.disconnect();
    });
    co.observe(el);
  });

  /* Klik folder -> pindah ke Portofolio & buka tab sesuai folder */
  $$("[data-open-tab]").forEach((folder) => {
    folder.addEventListener("click", () => {
      const btn = $(`.tabs button[data-tab="${folder.dataset.openTab}"]`);
      if (btn) btn.click();
    });
  });

  /* --- Tabs & Carousel + Efek Scroll Horizontal Smooth --- */
  const track = $(".track");
  const items = $$(".item");

  // Logika Tabs
  $$(".tabs button").forEach((b) =>
    b.addEventListener("click", () => {
      $$(".tabs button").forEach((x) => x.classList.toggle("on", x === b));
      items.forEach((i) => (i.hidden = i.dataset.group !== b.dataset.tab));
      // Reset posisi scroll track saat ganti tab
      track.style.transform = "translateX(0px)";
      track.dataset.scrollPos = 0;
    }),
  );

  // Logika Scroll Horizontal Smooth (Sticky)
  const pfSection = $("#portofolio");
  let isTicking = false;

  const updateHorizontalScroll = () => {
    if (!pfSection || !track) return;

    const rect = pfSection.getBoundingClientRect();
    const maxScroll = pfSection.offsetHeight - window.innerHeight;

    // Hitung progress scroll (0.0 sampai 1.0)
    let progress = Math.max(0, Math.min(1, -rect.top / maxScroll));

    // Hitung total jarak geser horizontal
    // track.scrollWidth = total lebar konten di dalamnya
    // track.clientWidth = lebar layar yang terlihat
    const maxTranslate = track.scrollWidth - track.clientWidth;

    // Jika konten lebih lebar dari layar, geser menggunakan transform
    if (maxTranslate > 0) {
      // Gunakan translateX agar jauh lebih mulus (GPU accelerated) daripada scrollLeft
      track.style.transform = `translateX(-${progress * maxTranslate}px)`;
    }

    isTicking = false;
  };

  // Event listener dengan requestAnimationFrame untuk performa 60fps
  addEventListener(
    "scroll",
    () => {
      if (!isTicking) {
        window.requestAnimationFrame(updateHorizontalScroll);
        isTicking = true;
      }
    },
    { passive: true },
  );

  // Tombol panah manual (opsional, akan menimpa animasi scroll sedikit)
  const step = () => (track.firstElementChild?.offsetWidth || 500) + 24;

  $(".prev").onclick = () => {
    const currentTranslate = new WebKitCSSMatrix(
      getComputedStyle(track).transform,
    ).m41;
    const newTranslate = Math.min(0, currentTranslate + step());
    track.style.transform = `translateX(${newTranslate}px)`;
  };

  $(".next").onclick = () => {
    const currentTranslate = new WebKitCSSMatrix(
      getComputedStyle(track).transform,
    ).m41;
    const maxTranslate = track.scrollWidth - track.clientWidth;
    const newTranslate = Math.max(-maxTranslate, currentTranslate - step());
    track.style.transform = `translateX(${newTranslate}px)`;
  };

  /* Tilt 3D saat hover */
  $$(".tilt").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5,
        y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(700px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateY(-4px)`;
    });
    el.addEventListener("mouseleave", () => (el.style.transform = ""));
  });

  /* Galeri: kartu bisa digeser */
  const gal = $("#gallery");
  let z = 5;
  $$(".pic").forEach((p) => {
    p.addEventListener("pointerdown", (e) => {
      p.setPointerCapture(e.pointerId);
      p.classList.add("drag");
      p.style.zIndex = ++z;
      const gr = gal.getBoundingClientRect(),
        pr = p.getBoundingClientRect();
      const ox = e.clientX - pr.left,
        oy = e.clientY - pr.top;
      const move = (ev) => {
        p.style.left =
          Math.max(
            0,
            Math.min(gr.width - pr.width, ev.clientX - gr.left - ox),
          ) + "px";
        p.style.top =
          Math.max(
            0,
            Math.min(gr.height - pr.height, ev.clientY - gr.top - oy),
          ) + "px";
      };
      const up = () => {
        p.classList.remove("drag");
        p.removeEventListener("pointermove", move);
        p.removeEventListener("pointerup", up);
      };
      p.addEventListener("pointermove", move);
      p.addEventListener("pointerup", up);
    });
  });

  /* Form kontak -> tautan WhatsApp */
  const wa = $("#waBtn"),
    nm = $("#cName"),
    ms = $("#cMsg");
  const build = () => {
    const text = `Halo, saya ${nm.value.trim() || "..."}. ${ms.value.trim() || "Saya melihat landing page Anda dan ingin berdiskusi."}`;
    wa.href = `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
  };
  nm.addEventListener("input", build);
  ms.addEventListener("input", build);
  build();

  /* Efek Spider-Man mengikuti kursor di foto About */
  const ph = $("#ahPhoto");
  if (ph) {
    ph.addEventListener("pointermove", (e) => {
      const r = ph.getBoundingClientRect();
      ph.style.setProperty("--cx", e.clientX - r.left + "px");
      ph.style.setProperty("--cy", e.clientY - r.top + "px");
      ph.classList.add("on");
    });
    ph.addEventListener("pointerleave", () => ph.classList.remove("on"));
  }

  /* Timeline: item aktif berganti mengikuti scroll di dalam daftar */
  $$(".steps").forEach((list) => {
    const steps = $$(".step", list);
    const maxScroll = () => list.scrollHeight - list.clientHeight;
    const act = (idx) =>
      steps.forEach((s, i) => s.classList.toggle("active", i === idx));

    const update = () => {
      const max = maxScroll();
      if (max <= 0) return; // daftar muat semua, tidak ada scroll
      const idx = Math.round((list.scrollTop / max) * (steps.length - 1));
      act(idx);
    };

    steps.forEach((s, i) => {
      s.addEventListener("click", () => {
        act(i);
        const max = maxScroll();
        if (max > 0) {
          list.scrollTo({
            top: (i / (steps.length - 1)) * max,
            behavior: "smooth",
          });
        }
      });
    });

    list.addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    update();
  });

  /* Efek zoom menembus huruf PORTOFOLIO (mask SVG: huruf = lubang ke latar putih) */
  const pfScene = $("#pfZoomScene"),
    pfSvg = $("#pfSvg"),
    pfText = $("#pfText"),
    pfWord = $("#pfWord"),
    pfDark = $("#pfDark");
  if (pfScene && pfSvg && pfText && pfWord && pfDark) {
    const smooth = (t) => t * t * (3 - 2 * t); // smoothstep
    let W = 0,
      H = 0,
      ox = 0,
      oy = 0,
      maxScale = 60;

    // Ukur & posisikan teks sesuai ukuran layar
    const layout = () => {
      W = innerWidth;
      H = innerHeight;
      pfSvg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      pfText.setAttribute("x", W / 2);
      pfText.setAttribute("y", H / 2);

      pfText.setAttribute("font-size", 100);
      pfText.setAttribute("letter-spacing", 2);
      const w100 = pfText.getBBox().width || 600;
      const fs = (100 * Math.min(W * 0.86, 1200)) / w100;
      pfText.setAttribute("font-size", fs.toFixed(1));
      pfText.setAttribute("letter-spacing", (fs * 0.02).toFixed(1));

      // Titik zoom = batang huruf "T" (huruf ke-4): bagian paling tebal & solid,
      // jadi saat di-zoom, hurufnya benar-benar memenuhi layar (bukan lubang "O").
      const r = pfText.getExtentOfChar(3);
      ox = r.x + r.width / 2;
      oy = r.y + r.height / 2;
      const stemHalf = r.width * 0.1;
      maxScale = (Math.max(ox, W - ox) + 60) / stemHalf;
      update();
    };

    const update = () => {
      const maxScroll = pfScene.offsetHeight - innerHeight;
      if (maxScroll <= 0) return;
      const p = clamp(-pfScene.getBoundingClientRect().top / maxScroll);

      // 0–18%: tulisan muncul halus (fade + naik sedikit)
      const fade = smooth(seg(p, 0, 0.18));
      // 18–35%: tahan sebentar supaya terbaca
      // 35–92%: zoom eksponensial (terasa konstan, tidak "ngebut di akhir")
      const q = smooth(seg(p, 0.35, 0.92));
      const s = Math.exp(Math.log(maxScale) * q);
      const slide = (1 - fade) * 28;

      pfWord.setAttribute("opacity", fade.toFixed(3));
      pfWord.setAttribute(
        "transform",
        `translate(0 ${slide.toFixed(1)}) translate(${ox} ${oy}) scale(${s.toFixed(4)}) translate(${-ox} ${-oy})`,
      );
      // Setelah layar penuh putih, lapisan gelap tidak perlu digambar lagi
      pfDark.style.display = q >= 1 ? "none" : "";
    };

    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", layout);
    layout();
    if (document.fonts && document.fonts.ready)
      document.fonts.ready.then(layout);
  }
})();
