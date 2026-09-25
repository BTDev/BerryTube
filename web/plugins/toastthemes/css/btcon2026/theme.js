(async () => {
  if (window.initBTCon2026WithIntro) return;

  const wait = async (interval) =>
    new Promise((res) => setTimeout(res, interval));
  const waitFrame = async () =>
    new Promise((res) => requestAnimationFrame(() => res()));
  function shuffle(array) {
    // Loop from back to front
    for (let i = array.length - 1; i > 0; i--) {
      // Pick a random element from 0 to i
      const j = Math.floor(Math.random() * (i + 1));

      // Swap elements using destructuring assignment
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  const stuff = `
    <div class="scene">
      <div class="bg"></div>
      <div class="sprites"></div>
    </div>
    <div class="thank_you">
      <span class="thank_1">
        Dear BerryTube
        <br />&nbsp;
      </span>
      <span class="thank_2" style="padding-bottom: 1em"> Thank you </span>
      <span class="thank_3" style="padding-bottom: 1em">
        for the 15 years of drunk* fun
        <span class="thank_5">❤️</span>
      </span>
      <span class="thank_4"> - the modmin team </span>
    </div>
    <div class="slides">
      <div class="spawner"></div>
    </div>
  `;

  class Fog {
    constructor(container) {
      this.createEl();

      container.append(this.el);
      this.fadeIn();
    }

    remove() {
      this.fadeOut();
      setTimeout(() => this.el.remove(), 3_000);
    }

    createEl() {
      this.el = document.createElement("div");
      this.el.classList.add("fog");
      this.getHeight();
      this.getWidth();
      this.getPosition();
      this.fadeIn();
    }

    getPosition() {
      this.position = 25 + Math.random() * 50 - this.width / 2;
      this.el.style.setProperty("--position", `${this.position}%`);
      this.el.style.setProperty("--wiggle", `${Math.random() * 20}%`);
      this.el.style.setProperty("--timing", `${15 + Math.random() * 10}s`);
    }

    getHeight() {
      this.height = 30 + Math.round(Math.random() * 130);
      this.el.style.setProperty("--height", `${this.height}%`);
    }

    getWidth() {
      this.width = 40 + Math.round(Math.random() * 150);
      this.el.style.setProperty("--width", `${this.width}%`);
    }

    fadeIn() {
      this.el.classList.add("fade-in");
    }

    fadeOut() {
      this.el.classList.add("fade-out");
    }
  }

  class Sprite {
    constructor(container) {
      this.createEl();

      container.append(this.el);
      this.fadeIn();
    }

    remove() {
      this.fadeOut();
      setTimeout(() => this.el.remove(), 3_000);
    }

    createEl() {
      this.el = document.createElement("div");
      this.el.classList.add("sprite");
      this.lightEl = document.createElement("div");
      this.lightEl.classList.add("light");
      this.el.append(this.lightEl);
      this.getSize();
      this.getPosition();
      this.getBrightness();
      this.fadeIn();
    }

    getPosition() {
      this.x = 0 + Math.random() * 100;
      this.y = 33 + Math.random() * 63 - this.size / 2;
      this.el.style.setProperty("--x", `${this.x}%`);
      this.el.style.setProperty("--y", `${this.y}%`);
      this.el.style.setProperty("--wiggle", `${Math.random() * 3}`);
      this.el.style.setProperty("--timing", `${15 + Math.random() * 80}s`);
    }

    getSize() {
      this.size = 15 + Math.round(Math.random() * 25);
      this.el.style.setProperty("--size", `${this.size}px`);
    }

    getBrightness() {
      this.brightness = 35 + Math.round(Math.random() * 65);
      this.el.style.setProperty("--brightness", `${this.brightness}%`);
    }

    fadeIn() {
      this.el.classList.add("fade-in");
    }

    fadeOut() {
      this.el.classList.add("fade-out");
    }
  }

  class Script {
    constructor(script) {
      this.script = script;
      this.startedAt = Date.now();

      if (this.script.length > 0) {
        this.play(0);
      }
    }

    currentDelta() {
      return Date.now() - this.startedAt;
    }

    async forStep(step) {
      const delta = this.script[step].startAt - this.currentDelta();
      if (delta > 0) await wait(delta);
    }

    async play(step) {
      await this.forStep(step);
      await this.script[step].do();
      if (this.script.length > step + 1) void this.play(step + 1);
    }
  }

  let bgContainer;
  let spriteContainer;

  const INTERVAL = 2000;
  const MIN_LAYERS = 4;
  const MAX_LAYERS = 12;
  const MIN_SPRITES = 12;
  const MAX_SPRITES = 24;

  const fogs = [];
  const sprites = [];

  const BG_RULES = {
    add: 20,
    remove: 20,
    noop: 100,
  };
  const SPRITE_RULES = {
    add: 40,
    remove: 40,
    noop: 100,
  };

  const getRule = (rules) =>
    Object.entries(rules).reduce(
      (p, [k, v]) => (typeof p === "number" ? (v < p ? p - v : k) : p),
      Math.random() * Object.values(BG_RULES).reduce((c, p) => p + c, 0)
    );

  const updateBG = async () => {
    const rule = getRule(BG_RULES);
    if (rule === "add" && fogs.length < MAX_LAYERS) {
      fogs.push(new Fog(bgContainer));
    }
    if (rule === "remove" && fogs.length > MIN_LAYERS) {
      const i = ~~(Math.random() * fogs);
      fogs[i].remove();
      fogs.splice(i, 1);
    }
  };

  const updateSprites = async () => {
    const rule = getRule(SPRITE_RULES);
    if (rule === "add" && sprites.length < MAX_SPRITES) {
      sprites.push(new Sprite(spriteContainer));
    }
    if (rule === "remove" && sprites.length > MIN_SPRITES) {
      const i = ~~(Math.random() * sprites);
      sprites[i].remove();
      sprites.splice(i, 1);
    }
  };

  const backgroundUpdate = async () => {
    await updateBG();
  };

  const backgroundScheduler = async () => {
    while (true) {
      await backgroundUpdate();
      await updateSprites();
      await wait(INTERVAL);
    }
  };

  const galleryScheduler = async () => {
    while (true) {
      if (Math.random() < 0.01) gallery = getGalleryQueue(galleryAll);
      await wait(INTERVAL);
    }
  };

  const getGallery = async () => {
    const prefix = "/plugins/toastthemes/css/btcon2026/";
    try {
      const list = await (
        await fetch("/plugins/toastthemes/css/btcon2026/list.php")
      ).json();
      const tree = {};

      for (const file of list) {
        const [, ...parts] = file.split("/");
        let branch = tree;
        parts.forEach((part, i) => {
          if (i + 1 < parts.length) {
            if (!branch[part]) branch[part] = {};
            branch = branch[part];
          } else {
            branch[part] = prefix + file;
          }
        });
      }
      return tree;
    } catch {}
    return {};
  };

  let galleryAll = await getGallery();

  const getGalleryQueue = (galleryAll) => {
    const submissions = Object.entries(galleryAll.submissions).flatMap(
      ([submitter, picsObj]) => {
        const pics = Object.values(picsObj);
        if (pics.length <= 3) return pics;
        return [
          ...pics.splice(Math.floor(Math.random() * pics.length), 1),
          ...pics.splice(Math.floor(Math.random() * pics.length), 1),
          ...pics.splice(Math.floor(Math.random() * pics.length), 1),
        ];
      }
    );
    const artists = Object.entries(galleryAll.artists).flatMap(
      ([submitter, picsObj]) => {
        const pics = Object.values(picsObj);
        return pics;
      }
    );
    return { submissions: shuffle(submissions), artists: shuffle(artists) };
  };

  let gallery = getGalleryQueue(galleryAll);

  const galleryRefreshScheduler = async () => {
    while (true) {
      await wait(600_000);
      galleryAll = await getGallery();
      gallery = getGalleryQueue(galleryAll);
    }
  };

  let slideSpawnerEl;
  const addImg = async (src, dir, size, pos) => {
    const mod = dir === "left" ? 1 : -1;
    const wrapper = document.createElement("div");
    wrapper.classList.add("item-wrapper");
    const item = document.createElement("img");
    item.src = src;
    wrapper.style.setProperty("--posX", `${-10 * mod}vw`);
    wrapper.style.setProperty("--size", `${size === "small" ? 0.6 : 1}`);
    wrapper.style.setProperty("--posZ", `-100vh`);
    wrapper.style.setProperty(
      "--posY",
      `${size === "small" ? (pos === "top" ? -20 : 20) : 0}%`
    );
    wrapper.style.setProperty("--rotY", `${70 * mod}deg`);

    wrapper.append(item);
    slideSpawnerEl.append(wrapper);
    await new Promise((res, rej) => {
      item.onload = res;
    });
    await waitFrame();
    await waitFrame();
    await waitFrame();
    // await wait(500);
    wrapper.classList.add("show");
    wrapper.style.setProperty("--posX", `${-50 * mod}vw`);
    wrapper.style.setProperty("--posZ", `40vh`);
    await wait(10_000);
    wrapper.remove();
  };

  let side = "left";
  const counters = {
    count: {
      left: 0,
      right: 0,
    },
    index: {
      submissions: 0,
      artists: 0,
    },
    pos: {
      left: "top",
      right: "bot",
    },
  };

  const addPic = async (side) => {
    let pic;
    let size;
    let pos;
    await wait(Math.random() * 4000);

    if (counters.count[side] === 0) {
      pic = gallery.artists[counters.index.artists];
      size = "big";
      counters.index.artists =
        (counters.index.artists + 1) % gallery.artists.length;
    } else {
      pic = gallery.submissions[counters.index.submissions];
      size = "small";
      counters.index.submissions =
        (counters.index.submissions + 1) % gallery.submissions.length;
      pos = counters.pos[side];
      counters.pos[side] = counters.pos[side] === "top" ? "bottom" : "top";
    }
    await addImg(pic, side, size, pos);

    counters.count[side] = (counters.count[side] + 1) % 4;

    await wait(5000);
    addPic(side);
  };

  const script = [
    {
      startAt: 10,
      do: async () => {
        document.body.classList.add("hide-others");
      },
    },
    {
      startAt: 3_000,
      do: async () => {
        document.documentElement.classList.add("btcon2026-enabled");
        const containerForAllThis = document.createElement("div");
        containerForAllThis.classList.add("btcon2026-bg");
        containerForAllThis.innerHTML = stuff;
        document.body.append(containerForAllThis);
        buildSettingsMenu();

        slideSpawnerEl = document.querySelector(".spawner");
        bgContainer = document.querySelector(".bg");
        spriteContainer = document.querySelector(".sprites");
        sprites.push(new Sprite(spriteContainer));
        sprites.push(new Sprite(spriteContainer));
        sprites.push(new Sprite(spriteContainer));
        sprites.push(new Sprite(spriteContainer));
        sprites.push(new Sprite(spriteContainer));
        sprites.push(new Sprite(spriteContainer));
      },
    },
    {
      startAt: 5_000,
      do: async () => {
        sprites.push(new Sprite(spriteContainer));
        sprites.push(new Sprite(spriteContainer));
      },
    },
    {
      startAt: 5_250,
      do: async () => {
        sprites.push(new Sprite(spriteContainer));
        sprites.push(new Sprite(spriteContainer));
      },
    },
    {
      startAt: 5_500,
      do: async () => {
        sprites.push(new Sprite(spriteContainer));
        sprites.push(new Sprite(spriteContainer));
      },
    },
    {
      startAt: 5_750,
      do: async () => {
        sprites.push(new Sprite(spriteContainer));
        sprites.push(new Sprite(spriteContainer));
      },
    },
    {
      startAt: 6_000,
      do: async () => {
        sprites.push(new Sprite(spriteContainer));
        sprites.push(new Sprite(spriteContainer));
      },
    },
    {
      startAt: 6_250,
      do: async () => {
        sprites.push(new Sprite(spriteContainer));
        sprites.push(new Sprite(spriteContainer));
      },
    },
    {
      startAt: 6_500,
      do: async () => {
        sprites.push(new Sprite(spriteContainer));
        sprites.push(new Sprite(spriteContainer));
      },
    },
    {
      startAt: 6_750,
      do: async () => {
        sprites.push(new Sprite(spriteContainer));
        sprites.push(new Sprite(spriteContainer));
      },
    },
    {
      startAt: 7_000,
      do: async () => {
        sprites.push(new Sprite(spriteContainer));
        sprites.push(new Sprite(spriteContainer));
      },
    },
    {
      startAt: 10_000,
      do: async () => {
        document.querySelector(".thank_1").classList.add("show");
      },
    },
    {
      startAt: 12_000,
      do: async () => {
        document.querySelector(".thank_2").classList.add("show");
      },
    },
    {
      startAt: 13_000,
      do: async () => {
        document.querySelector(".thank_3").classList.add("show");
      },
    },
    {
      startAt: 15_000,
      do: async () => {
        document.querySelector(".thank_4").classList.add("show");
      },
    },
    {
      startAt: 17_000,
      do: async () => {
        document.querySelector(".thank_5").classList.add("show");
      },
    },
    {
      startAt: 19_000,
      do: async () => {
        document.querySelector(".thank_you").classList.add("hide");
      },
    },
    {
      startAt: 20_000,
      do: async () => {
        fogs.push(new Fog(bgContainer));
      },
    },
    {
      startAt: 20_250,
      do: async () => {
        fogs.push(new Fog(bgContainer));
      },
    },
    {
      startAt: 20_500,
      do: async () => {
        fogs.push(new Fog(bgContainer));
      },
    },
    {
      startAt: 20_750,
      do: async () => {
        fogs.push(new Fog(bgContainer));
      },
    },
    {
      startAt: 21_000,
      do: async () => {
        fogs.push(new Fog(bgContainer));
        fogs.push(new Fog(bgContainer));
        fogs.push(new Fog(bgContainer));
        void backgroundScheduler();
        addPic("left");
        addPic("right");
        galleryRefreshScheduler();
      },
    },
    {
      startAt: 25_000,
      do: async () => {
        document.body.classList.remove("hide-others");
      },
    },
  ];

  const key = "btcon2026_settings";
  const loadSettings = () => {
    const raw = localStorage.getItem(key);
    const settings = {
      staticBackground: false,
      disableGallery: false,
      replayIntro: false,
    };
    try {
      const loadedSettings = JSON.parse(raw);

      if (typeof loadedSettings?.staticBackground === "boolean")
        settings.staticBackground = loadedSettings.staticBackground;
      if (typeof loadedSettings?.disableGallery === "boolean")
        settings.disableGallery = loadedSettings.disableGallery;
      if (typeof loadedSettings?.replayIntro === "boolean") {
        settings.replayIntro = loadedSettings.replayIntro;
      }
    } catch {}
    return settings;
  };
  const saveSettings = () => {
    localStorage.setItem(key, JSON.stringify(settings));
  };
  const settings = loadSettings();

  const settingsMenu = [
    {
      text: "Static Background",
      type: "checkbox",
      value: settings.staticBackground,
      do: (value) => {
        settings.staticBackground = value;
        saveSettings();
      },
    },
    {
      text: "Disable Gallery",
      type: "checkbox",
      value: settings.disableGallery,
      do: (value) => {
        settings.disableGallery = value;
        saveSettings();
      },
    },
    {
      text: "Replay Intro",
      type: "button",
      do: () => {
        settings.replayIntro = true;
        saveSettings();
      },
    },
  ];

  const buildSettingsMenu = () => {
    const el = document.createElement("div");
    el.classList.add("btcon2026-settings");
    el.innerHTML = `
      <button type="button" class="toggle">«</button>
      <div class="drawer">
        <div class="menu-container"></div>
      </div>`;
    document.body.append(el);
    el.querySelector("button.toggle").addEventListener("click", function () {
      el.querySelector(".drawer").classList.toggle("open");
    });
    const menu = el.querySelector(".menu-container");
    let menuHTML = "";
    for (const setting of settingsMenu) {
      const menuEl = document.createElement("div");
      if (setting.type === "button") {
        menuEl.innerHTML = `<label><button class="control" type="button">${setting.text}</button></label>`;
      } else if (setting.type === "checkbox") {
        menuEl.innerHTML = `<label><input class="control" type="checkbox" ${
          setting.value ? 'checked="true"' : ""
        } />${setting.text}</label>`;
      }
      menu.append(menuEl);
      menuEl.querySelector(".control").addEventListener("click", (ev) => {
        setting.do(ev?.target?.checked);
        msgEl.innerHTML = "Refresh the page for settings to take effect";
      });
    }
    const msgEl = document.createElement("div");
    msgEl.classList.add("msg");
    menu.append(msgEl);
  };

  window.initBTCon2026WithIntro = () => {
    const animation = new Script(script);
  };

  window.initBTCon2026WithoutIntro = () => {
    document.documentElement.classList.add("btcon2026-enabled");
    const containerForAllThis = document.createElement("div");
    containerForAllThis.classList.add("btcon2026-bg");
    containerForAllThis.innerHTML = stuff;
    document.body.append(containerForAllThis);
    bgContainer = document.querySelector(".bg");
    buildSettingsMenu();

    if (!settings.staticBackground) {
      spriteContainer = document.querySelector(".sprites");
      slideSpawnerEl = document.querySelector(".spawner");
      for (let i = 0; i < 7; i++) fogs.push(new Fog(bgContainer));

      for (let i = 0; i < 24; i++) sprites.push(new Sprite(spriteContainer));
      void backgroundScheduler();
    } else {
      bgContainer.classList.add("static");
    }

    if (!settings.disableGallery) {
      addPic("left");
      addPic("right");
      galleryRefreshScheduler();
    }
  };

  if (window.BTCON_2026_MANUAL) return;

  if (settings.replayIntro) {
    await wait(10_000);
    settings.replayIntro = false;
    saveSettings();
    window.initBTCon2026WithIntro();
  } else {
    window.initBTCon2026WithoutIntro();
  }
})();

