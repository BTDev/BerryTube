(() => {
  // from https://stackoverflow.com/a/2450976
  function shuffle(array) {
    let currentIndex = array.length,
      randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex > 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }

    return array;
  }

  const pics = [
    "/plugins/toastthemes/css/btcon2023/images/gallery/CadetRedShirt.png",
    "/plugins/toastthemes/css/btcon2023/images/gallery/dogg.png",
    "/plugins/toastthemes/css/btcon2023/images/gallery/ImAFutureGuitarHero.jpg",
    "/plugins/toastthemes/css/btcon2023/images/gallery/moozua.png",
    "/plugins/toastthemes/css/btcon2023/images/gallery/Naen.png",
    "/plugins/toastthemes/css/btcon2023/images/gallery/Nootaz.png",
    "/plugins/toastthemes/css/btcon2023/images/gallery/Pugnippets.jpg",
    "/plugins/toastthemes/css/btcon2023/images/gallery/Rainspeak.png",
    "/plugins/toastthemes/css/btcon2023/images/gallery/SimonAquarius.png",
    "/plugins/toastthemes/css/btcon2023/images/gallery/Taurson.png",
    [
      "/plugins/toastthemes/css/btcon2023/images/gallery/TheRealAkiNeko_1.png",
      "/plugins/toastthemes/css/btcon2023/images/gallery/TheRealAkiNeko_2.png",
    ],
    "/plugins/toastthemes/css/btcon2023/images/gallery/Trees.jpg",
    "/plugins/toastthemes/css/btcon2023/images/gallery/Yakoshi.png",
  ];

  shuffle(pics);

  const picsHtml = pics
    .flatMap((p) =>
      (Array.isArray(p) ? p : [p]).map(
        (p) => `<div class="btcon2-marquee-item"><img src="${p}" alt=""></div>`
      )
    )
    .join("");

  const html = `
    <div class="btcon2-marquee-container">
      <div class="btcon2-marquee">
        <div class="btcon2-marquee-content"> 
          ${picsHtml}
          ${picsHtml}
        </div>
      </div>
    </div>
  `;

  whenExists("#videobg", (videobg) => {
    videobg.prepend(html);
  });
})();
