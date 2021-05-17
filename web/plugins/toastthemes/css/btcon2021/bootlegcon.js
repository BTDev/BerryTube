whenExists('#banner', () => {
  $.ajax({
    url: "plugins/toastthemes/css/btcon2021/images/banner.svg",
    method: "GET",
    dataType: "text",
  }).then((svg_sauce) => {
    var titels = `
BTCon
BreryCone
HonseCon
Harry Potter
sample text
FruitCylinderCon
Sir, this is a Wendy’s
Redliiiiiiiiiiineeeeeeeee
Smol Hornse Fierndship Gather
`
      .split("\n")
      .filter((x) => x.trim() != "");
    var erroretitels = `
&#60failed to reach translation server&#62
404
Error 418
pls help am stuck inside
lp0 on fire
bt: not a typewriter
not in sudoers file
`
      .split("\n")
      .filter((x) => x.trim() != "");
    var errore = Math.random() < 0.9;

    var svg_spicy = errore
      ? svg_sauce.replace(
          "Redliiiiiiiiiiineeeeeeeee",
          titels[~~(Math.random() * titels.length)]
        )
      : svg_sauce
          .replace(
            "Redliiiiiiiiiiineeeeeeeee",
            erroretitels[~~(Math.random() * erroretitels.length)]
          )
          .replace(
            `'Papyrus-Regular', 'Papyrus', cursive`,
            `'Courier New', monospaced`
          )
          .replace("fill:rgb(102,49,0)", "fill:rgb(255,40,40)");

    var bananer = document.getElementById("banner");
    bananer.innerHTML = svg_spicy;

    var ankl = "plugins/toastthemes/css/btcon2021/images/ankles.png";

    for (let iiiiii = 0; iiiiii < 200; iiiiii++) {
      setTimeout((_) => {
        $("body").append(`
        <img class="toastthemes-theme-specific" style="
            transform: rotate(${~~(
              Math.random() * 360
            )}deg) scale(${Math.random()});
            opacity: ${Math.random()};
            z-index: 0;
            position:absolute;
            top:${Math.random() * document.body.clientHeight}px;
            left:${
              Math.random() * document.body.clientWidth
            }px" src="${ankl}" />
    `);
      }, 0);
    }

    var mobie = "plugins/toastthemes/css/btcon2021/images/movie_poster.png";
    $("body").append(`
    <img class="toastthemes-theme-specific" style="
        transform: rotate(${~~(Math.random() * 90) - 45}deg) scale(${
      Math.random() + 0.3
    });
        opacity: ${Math.random() * 0.5 + 0.5};
        z-index: 0;
        position:absolute;
        top:${Math.random() * document.body.clientHeight}px;
        left:${Math.random() * document.body.clientWidth}px" src="${mobie}" />
`);

    var beegees = "plugins/toastthemes/css/btcon2021/images/bg/bg";
    $("body").append(`
    <style class="toastthemes-theme-specific">
        #videobg {
            background: url(${
              beegees + ~~(Math.random() * 19 + 1)
            }.png) no-repeat center center !important;
        }
    </style>
`);
  });
});
