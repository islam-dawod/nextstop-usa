/* NEXT STOP USA — shared behaviour. Design preview: nothing is connected to live data. */
(function () {
  "use strict";

  // ---- Mobile menu ----
  var btn = document.getElementById("menuBtn");
  var nav = document.getElementById("nav");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A" && nav.classList.contains("open")) {
        nav.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
      }
    });
  }

  // ---- Generic form stubs (newsletter / profession band on any page) ----
  function stub(formId, msgId, text) {
    var f = document.getElementById(formId), m = document.getElementById(msgId);
    if (!f) return;
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      if (m) m.textContent = text;
    });
  }
  stub("professionForm", "professionMsg", "Design preview — the profession search isn’t connected to live data yet. Open the Careers tool to see a sample result.");
  stub("newsletterForm", "newsletterMsg", "Thanks! This is a design preview, so sign-ups aren’t live yet.");

  // ---- Careers tool (careers.html) ----
  var cForm = document.getElementById("careersForm");
  if (cForm) {
    var cResult = document.getElementById("careersResult");
    var cTitle = document.getElementById("crTitle");
    cForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = (cForm.elements.profession.value || "").trim();
      if (cTitle) cTitle.textContent = val ? val : "Your profession";
      if (cResult) {
        cResult.hidden = false;
        cResult.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  // ---- Explore My Options (explore.html) ----
  var eForm = document.getElementById("exploreForm");
  if (eForm) {
    var eResult = document.getElementById("exploreResult");
    var ePaths = document.getElementById("pathways");
    var eGoalOut = document.getElementById("goalOut");

    var LIB = {
      work: [
        { name: "Employer-sponsored work routes", have: ["You are focused on working in the U.S.", "A clear profession or field"], need: ["A U.S. employer willing to sponsor", "Role and qualifications that match the category"] },
        { name: "Skills- and talent-based routes", have: ["A defined profession"], need: ["Evidence of qualifications or experience", "Category-specific criteria met"] }
      ],
      study: [
        { name: "International student routes", have: ["You are focused on studying in the U.S."], need: ["Acceptance from an approved institution", "Proof of funding for tuition and living costs"] },
        { name: "Exchange and training routes", have: ["Interest in a U.S. program"], need: ["A sponsoring program", "Program-specific eligibility"] }
      ],
      visit: [
        { name: "Visitor routes (tourism / business)", have: ["You are planning a temporary visit"], need: ["Purpose that fits a short stay", "Ties to your home country and funds for the trip"] },
        { name: "Visa-waiver style travel (where eligible)", have: ["A short, qualifying trip"], need: ["Eligible nationality and valid travel authorization", "Trip within allowed length and purpose"] }
      ]
    };

    eForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var goal = eForm.elements.goal.value || "work";
      var list = LIB[goal] || LIB.work;
      if (eGoalOut) {
        eGoalOut.textContent = goal === "study" ? "studying" : goal === "visit" ? "visiting" : "working";
      }
      if (ePaths) {
        ePaths.innerHTML = "";
        list.forEach(function (p) {
          var el = document.createElement("div");
          el.className = "pathway";
          var conds = "";
          p.have.forEach(function (h) { conds += '<span><span class="ic">✓</span>' + esc(h) + "</span>"; });
          p.need.forEach(function (n) { conds += '<span class="missing"><span class="ic missing">○</span>Still needed: ' + esc(n) + "</span>"; });
          el.innerHTML = '<h4>' + esc(p.name) + '</h4><div class="cond">' + conds + "</div>";
          ePaths.appendChild(el);
        });
      }
      if (eResult) {
        eResult.hidden = false;
        eResult.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // ---- Footer year ----
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
