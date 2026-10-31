
// =========================
// 英作文の添削機能
// =========================

// APIサーバーの接続先
// サーバー完成後にURLを設定します。
const CORRECTION_API_URL = "/api/correct";

document.addEventListener("DOMContentLoaded", () => {

  // HTMLの要素を取得
  const answerInput = document.getElementById("answer-input");
  const answerCount = document.getElementById("answer-count");
  const submitButton = document.getElementById("submit-answer");
  const answerError = document.getElementById("answer-error");
  const resultArea = document.getElementById("correction-result");

  // =========================
  // 文字数の表示
  // =========================

  answerInput.addEventListener("input", () => {
    answerCount.textContent = `${answerInput.value.length}文字`;
  });


  // =========================
  // 間違いの表示
  // =========================

  function displayErrors(elementId, errors) {

    const container = document.getElementById(elementId);

    container.replaceChildren();

    // 間違いがない場合
    if (!Array.isArray(errors) || errors.length === 0) {

      const message = document.createElement("p");
      message.className = "no-error";
      message.textContent = "この項目に間違いはありません。";

      container.appendChild(message);
      return;
    }

    // 間違いを1つずつ表示
    errors.forEach((error) => {

      const item = document.createElement("div");
      item.className = "error-item";

      const original = document.createElement("p");
      original.className = "error-original";
      original.textContent =
        `間違い：${error.original || "未指定"}`;

      const corrected = document.createElement("p");
      corrected.className = "error-correct";
      corrected.textContent =
        `正しい表現：${error.corrected || "未指定"}`;

      const explanation = document.createElement("p");
      explanation.className = "error-explanation";
      explanation.textContent =
        `解説：${error.explanation || "解説なし"}`;

      item.append(original, corrected, explanation);
      container.appendChild(item);
    });
  }


  // =========================
  // 間違いを学習リストに保存
  // =========================

  async function saveCorrectionErrors(data) {

    // 保存する間違いの種類
    const errorGroups = [
      {
        type: "spelling",
        errors: data.spellingErrors
      },
      {
        type: "grammar",
        errors: data.grammarErrors
      },
      {
        type: "structure",
        errors: data.structureErrors
      }
    ];

    // 種類ごとに保存
    for (const group of errorGroups) {

      if (!Array.isArray(group.errors)) {
        continue;
      }

      for (const error of group.errors) {

        // 必要な情報をデータベースに保存
        await saveLearningItem({
          type: group.type,
          original: error.original || "",
          corrected: error.corrected || "",
          explanation: error.explanation || ""
        });

      }
    }
  }


  // =========================
  // 添削結果の表示
  // =========================

  async function displayCorrection(data) {

    // 総合コメント
    document.getElementById("overall-comment").textContent =
      data.overallComment || "総合コメントはありません。";

    // 修正後の英文
    document.getElementById("corrected-answer").textContent =
      data.correctedAnswer || "修正例がありません。";

    // 各種類の間違い
    displayErrors("spelling-errors", data.spellingErrors);
    displayErrors("grammar-errors", data.grammarErrors);

    // 構文エラー
    displayErrors("structure-errors", data.structureErrors);


    // =========================
    // 言い換え表現
    // =========================

    const alternativeContainer =
      document.getElementById("alternative-expressions");

    alternativeContainer.replaceChildren();

    if (!Array.isArray(data.alternatives) ||
        data.alternatives.length === 0) {

      const message = document.createElement("p");
      message.className = "no-error";
      message.textContent = "言い換え表現はありません。";

      alternativeContainer.appendChild(message);

    } else {

      data.alternatives.forEach((alternative) => {

        const item = document.createElement("div");
        item.className = "error-item";

        const sentence = document.createElement("p");
        sentence.className = "error-correct";
        sentence.textContent = alternative.sentence || "";

        const explanation = document.createElement("p");
        explanation.className = "error-explanation";
        explanation.textContent = alternative.explanation || "";

        item.append(sentence, explanation);
        alternativeContainer.appendChild(item);

      });
    }


    // =========================
    // 学習リストへの保存
    // =========================

    await saveCorrectionErrors(data);


    // 添削結果を表示
    resultArea.hidden = false;

    resultArea.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }


  // =========================
  // 添削ボタンを押したとき
  // =========================

  async function submitAnswer() {

    const answer = answerInput.value.trim();

    // 入力チェック
    if (!answer) {

      answerError.textContent = "解答を入力してください。";
      answerError.hidden = false;

      return;
    }

    // 問題の情報を取得
    const question =
      document.getElementById("question-text").textContent;

    const category =
      document.getElementById("question-category").textContent;

    const difficulty =
      document.getElementById("question-difficulty").textContent;


    // 表示をリセット
    answerError.hidden = true;
    resultArea.hidden = true;

    submitButton.disabled = true;
    submitButton.textContent = "添削中...";


    try {

      // 添削APIにデータを送信
      const response = await fetch(CORRECTION_API_URL, {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          question,
          answer,
          category,
          difficulty
        })

      });


      // 通信エラーの確認
      if (!response.ok) {
        throw new Error(`サーバーエラー：${response.status}`);
      }


      // 添削結果を取得
      const data = await response.json();


      // 添削結果を表示・保存
      await displayCorrection(data);


    } catch (error) {

      console.error("添削エラー:", error);

      answerError.textContent =
        "添削サーバーに接続できません。APIサーバーの設定を確認してください。";

      answerError.hidden = false;


    } finally {

      // ボタンを元に戻す
      submitButton.disabled = false;
      submitButton.textContent = "添削する →";

    }
  }


  // 添削ボタンに処理を設定
  submitButton.addEventListener("click", submitAnswer);

});
