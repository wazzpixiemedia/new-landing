// Simple preview gate (client-side). Not strong security.
(function(){
  const CODE = "4826";
  const COOKIE_NAME = "argo_preview_ok";

  function hasCookie(){
    return document.cookie.split(';').some(c => c.trim().startsWith(COOKIE_NAME + "=1"));
  }

  function setCookie(){
    // 4 hours
    document.cookie = COOKIE_NAME + "=1; Max-Age=" + (4*60*60) + "; Path=/; SameSite=Lax";
  }

  function showGate(){
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .argoGateOverlay{position:fixed;inset:0;background:rgba(15,15,15,.75);display:flex;align-items:center;justify-content:center;z-index:99999}
      .argoGateCard{width:min(520px,92vw);background:#fff;border:1px solid #e5e5e5;padding:26px;border-radius:8px;font-family:Arial,Helvetica,sans-serif;box-shadow:0 18px 60px rgba(0,0,0,.35)}
      .argoGateTitle{margin:0 0 8px;font-size:20px;color:#111;font-weight:700}
      .argoGateText{margin:0 0 16px;color:#444;line-height:1.5}
      .argoGateRow{display:flex;gap:10px;align-items:center}
      .argoGateInput{flex:1;border:1px solid #ddd;border-radius:6px;padding:12px 12px;font-size:16px;outline:none}
      .argoGateInput:focus{border-color:#AE0C21}
      .argoGateBtn{border:none;border-radius:6px;padding:12px 16px;background:#AE0C21;color:#fff;font-weight:700;cursor:pointer}
      .argoGateBtn:hover{background:#8E091B}
      .argoGateErr{margin-top:10px;color:#AE0C21;font-weight:700;display:none}
      body.argoGateLocked{overflow:hidden}
    `;
    document.head.appendChild(style);

    // Add overlay
    const overlay = document.createElement('div');
    overlay.className = 'argoGateOverlay';
    overlay.innerHTML = `
      <div class="argoGateCard" role="dialog" aria-modal="true" aria-label="Vorschau-Zugang">
        <p class="argoGateTitle">Vorschau – Zugangscode erforderlich</p>
        <p class="argoGateText">Bitte geben Sie den 4-stelligen Code ein, um die Seite zu öffnen.</p>
        <div class="argoGateRow">
          <input class="argoGateInput" inputmode="numeric" maxlength="4" placeholder="Code (z. B. 1234)" aria-label="Zugangscode" />
          <button class="argoGateBtn" type="button">Öffnen</button>
        </div>
        <div class="argoGateErr">Falscher Code.</div>
      </div>
    `;
    document.body.classList.add('argoGateLocked');
    document.body.appendChild(overlay);

    const input = overlay.querySelector('input');
    const btn = overlay.querySelector('button');
    const err = overlay.querySelector('.argoGateErr');

    function submit(){
      const val = (input.value || "").trim();
      if(val === CODE){
        setCookie();
        document.body.classList.remove('argoGateLocked');
        overlay.remove();
      } else {
        err.style.display = "block";
        input.focus();
        input.select();
      }
    }

    btn?.addEventListener('click', submit);
    input?.addEventListener('keydown', e => { if(e.key === "Enter") submit(); });
    setTimeout(() => input?.focus(), 50);
  }

  function init(){
    if(!hasCookie()) showGate();
  }

  if(document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

// ------------------------------
// 26-feb JS changes (featureCards + filter)
// ------------------------------
document.addEventListener("DOMContentLoaded", function () {

  // ---- Feature Cards (cityQuick) ----
  const featureCards = document.querySelectorAll('.featureRow .featureCard');
  const cityQuick = document.querySelector('#city'); // matches your HTML

  if(cityQuick){
    cityQuick.addEventListener('change', function() {
      const selectedIndex = cityQuick.selectedIndex;

      featureCards.forEach((card, index) => {
        if(selectedIndex === 0 || index === selectedIndex - 1){
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  // ---- Filter functionality ----
  const applyBtn = document.getElementById("apply");
  const listingGrid = document.getElementById("listingGrid");

  if(applyBtn && listingGrid){
    applyBtn.addEventListener("click", function () {

      const cityValue = document.getElementById("city")?.value || "";
      const roomsValue = document.getElementById("rooms")?.value || "";
      const maxPrice = document.getElementById("price")?.value || "";
      const minArea = document.getElementById("area")?.value || "";

      const listings = listingGrid.querySelectorAll(".listing");
      let visibleCount = 0;

      listings.forEach(listing => {
        const listingCity = listing.dataset.city;
        const listingRooms = listing.dataset.rooms;
        const listingPrice = parseInt(listing.dataset.price || 0);
        const listingArea = parseInt(listing.dataset.area || 0);

        let show = true;

        // City filter
        if(cityValue && listingCity !== cityValue) show = false;

        // Rooms filter
        if(roomsValue){
          if(roomsValue === "4"){
            if(parseInt(listingRooms) < 4) show = false;
          } else if(listingRooms !== roomsValue) show = false;
        }

        // Max price filter
        if(maxPrice && listingPrice > parseInt(maxPrice)) show = false;

        // Min area filter
        if(minArea && listingArea < parseInt(minArea)) show = false;

        listing.style.display = show ? "" : "none";
        if(show) visibleCount++;
      });

      // Remove old message
      const existingMessage = document.querySelector(".not-found");
      if(existingMessage) existingMessage.remove();

      // Add message if no results
      if(visibleCount === 0){
        const message = document.createElement("h2");
        message.className = "not-found";
        message.textContent = "No result found";
        listingGrid.parentNode?.insertBefore(message, listingGrid.nextSibling);
      }

    });
  }

});
