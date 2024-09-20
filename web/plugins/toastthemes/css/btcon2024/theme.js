((_) => {
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
    "/plugins/toastthemes/css/btcon2024/images/gallery/akineko_variantA.png",
    "/plugins/toastthemes/css/btcon2024/images/gallery/BT_Con_2024_Trixie.png",
    "/plugins/toastthemes/css/btcon2024/images/gallery/cadet_variantA_nobg.png",
    "/plugins/toastthemes/css/btcon2024/images/gallery/guitarhero_variantA.jpg",
    "/plugins/toastthemes/css/btcon2024/images/gallery/joro_variantA.png",
    "/plugins/toastthemes/css/btcon2024/images/gallery/moozua_variantA.png",
    "/plugins/toastthemes/css/btcon2024/images/gallery/naen_variantA_nobg.png",
    "/plugins/toastthemes/css/btcon2024/images/gallery/nootaz_variantA_nobg.png",
    "/plugins/toastthemes/css/btcon2024/images/gallery/taurson_variantB_nobg.png",
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
  $("#videobg").prepend(html);
})();
