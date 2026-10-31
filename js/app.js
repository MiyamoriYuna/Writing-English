
// =========================
// ページ切り替え
// =========================

document.addEventListener("DOMContentLoaded", () => {

  // ページ名
  const pageNames = [
    "home",
    "writing",
    "lists",
    "tests",
    "settings"
  ];

  // ページ切り替えボタン
  const pageLinks = document.querySelectorAll(
    "[data-page-link]"
  );

  // 各ページ
  const pages = document.querySelectorAll(".page");

  // 下部ナビゲーション
  const navItems = document.querySelectorAll(".nav-item");


  // ページを表示する関数
  function showPage(pageName) {

    // 存在しないページ名の場合はホームに戻す
    if (!pageNames.includes(pageName)) {
      pageName = "home";
    }

    // ページの表示・非表示
    pages.forEach((page) => {

      page.classList.toggle(
        "active",
        page.id === `page-${pageName}`
      );

    });

    // ナビゲーションの選択状態
    navItems.forEach((item) => {

      const isActive =
        item.dataset.pageLink === pageName;

      item.classList.toggle("active", isActive);

      if (isActive) {
        item.setAttribute("aria-current", "page");
      } else {
        item.removeAttribute("aria-current");
      }

    });

    // 画面上部に戻る
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  }


  // 各ボタンにクリックイベントを設定
  pageLinks.forEach((link) => {

    link.addEventListener("click", () => {

      showPage(link.dataset.pageLink);

    });

  });


  // 最初はホーム画面を表示
  showPage("home");

});
