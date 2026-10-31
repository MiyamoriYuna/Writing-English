
// =========================
// 学習リスト管理
// =========================

document.addEventListener("DOMContentLoaded", () => {

  const listContainer =
    document.getElementById("learning-list");

  const categoryButtons =
    document.querySelectorAll("[data-list-type]");

  const sampleButton =
    document.getElementById("add-sample-data");

  let currentType = "spelling";


  // 学習リストを表示
  async function displayLearningList() {

    listContainer.replaceChildren();

    try {

      const allItems = await getLearningItems();

      const items = allItems.filter(item =>
        item.type === currentType
      );

      if (items.length === 0) {

        const message = document.createElement("p");
        message.className = "empty-state";
        message.textContent = "現在、登録されている学習内容はありません。";

        listContainer.appendChild(message);
        return;
      }

      items.forEach(item => {

        const card = document.createElement("div");
        card.className = "learning-item";

        const original = document.createElement("h3");
        original.textContent = item.original;

        const corrected = document.createElement("p");
        corrected.textContent = `正しい表現：${item.corrected}`;

        const explanation = document.createElement("p");
        explanation.textContent = `解説：${item.explanation}`;

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "secondary-button";
        deleteButton.textContent = "削除";

        deleteButton.addEventListener("click", async () => {

          await deleteLearningItem(item.id);
          displayLearningList();

        });

        card.append(
          original,
          corrected,
          explanation,
          deleteButton
        );

        listContainer.appendChild(card);

      });

    } catch (error) {

      console.error("学習リストの読み込みエラー:", error);
      listContainer.textContent =
        "学習リストを読み込めませんでした。";

    }

  }


  // 種類の切り替え
  categoryButtons.forEach(button => {

    button.addEventListener("click", () => {

      currentType = button.dataset.listType;

      categoryButtons.forEach(item =>
        item.classList.remove("active")
      );

      button.classList.add("active");

      displayLearningList();

    });

  });


  // サンプルデータの登録
  sampleButton.addEventListener("click", async () => {

    const samples = [
      {
        type: "spelling",
        original: "studing",
        corrected: "studying",
        explanation: "studyにingを付ける場合、yをiに変えてstudyingとします。"
      },
      {
        type: "grammar",
        original: "He play tennis.",
        corrected: "He plays tennis.",
        explanation: "主語が三人称単数の現在形では、一般動詞にsを付けます。"
      },
      {
        type: "structure",
        original: "I very like music.",
        corrected: "I like music very much.",
        explanation: "veryは通常、一般動詞のlikeを直接修飾しません。"
      }
    ];

    for (const sample of samples) {
      await saveLearningItem(sample);
    }

    alert("サンプルデータを登録しました。");

    displayLearningList();

  });


  // 初期表示
  displayLearningList();

});
