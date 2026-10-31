
// =========================
// 英作文の添削機能
// =========================

// APIサーバーの接続先
// サーバー完成後にURLを設定します。
const CORRECTION_API_URL = "/api/correct";

document.addEventListener("DOMContentLoaded", () => {

  const answerInput =
    document.getElementById("answer-input");

  const answerCount =
    document.getElementById("answer-count");

  const submitButton =
    document.getElementById("submit-answer");

  const answerError =
    document.getElementById("answer-error");

  const resultArea =
    document.getElementById("correction-result");


  // =========================
  // 文字数の表示
  // =========================

  answerInput.addEventListener("input", () => {

    answerCount.textContent =
      `${answerInput.value.length}文字`;

  });


  // =========================
  // 添削結果を表示する関数
  // =========================

  function displayErrors(elementId, errors) {

    const container =
      document.getElementById(elementId);

    container.replaceChildren();

    if (!Array.isArray(errors) || errors.length === 0) {

      const message = document.createElement("p");

      message.className = "no-error";
      message.textContent = "この項目に間違いはありません。";

      container.appendChild(message);

      return;
    }


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

      item.append(
        original,
        corrected,
        explanation
      );

      container.appendChild(item);

    });

  }


  // =========================
  // 添削結果を画面に反映
  // =========================

  function displayCorrection(data) {

    document.getElementById("overall-comment").textContent =
      data.overallComment || "総合コメントはありません。";

    document.getElementById("corrected-answer").textContent =
      data.correctedAnswer || "修正例がありません。";


    // スペルミス
    displayErrors(
      "spelling-errors",
      data.spellingErrors
    );

    // 文法ミス
    displayErrors(
      "grammar-errors",
      data.grammarErrors
    );

    // 構文ミス
    displayErrors(
      "structureErrors",
      data.structureErrors
    );


    // 言い換え表現
    const alternativeContainer =
      document.getElementById("alternative-expressions");

    alternativeContainer.replaceChildren();

    if (
      !Array.isArray(data.alternatives) ||
      data.alternatives.length === 0
    ) {

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
        explanation.textContent =
          alternative.explanation || "";

        item.append(sentence, explanation);

        alternativeContainer.appendChild(item);

      });

    }

    resultArea.hidden = false;

    resultArea.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  }


  // =========================
  // 添削を実行
  // =========================

  async function submitAnswer() {

    const answer = answerInput.value.trim();

    // 空欄チェック
    if (!answer) {

      answerError.textContent =
        "解答を入力してください。";

      answerError.hidden = false;

      return;
    }

    // 現在表示されている問題を取得
    const question =
      document.getElementById("question-text").textContent;

    const category =
      document.getElementById("question-category").textContent;

    const difficulty =
      document.getElementById("question-difficulty").textContent;


    answerError.hidden = true;
    resultArea.hidden = true;

    submitButton.disabled = true;
    submitButton.textContent = "添削中...";


    try {

      // APIサーバーに解答を送信
      const response = await fetch(
        CORRECTION_API_URL,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            question: question,
            answer: answer,
            category: category,
            difficulty: difficulty

          })

        }
      );


      // 通信エラー
      if (!response.ok) {
        throw new Error(
          `サーバーエラー：${response.status}`
        );
      }


      // 添削結果を取得
      const data = await response.json();

      // 結果を表示
      displayCorrection(data);

    } catch (error) {

      console.error("添削エラー:", error);

      answerError.textContent =
        "添削サーバーに接続できません。APIサーバーの設定を確認してください。";

      answerError.hidden = false;

    } finally {

      submitButton.disabled = false;
      submitButton.textContent = "添削する →";

    }

  }


  // ボタンにイベントを設定
  submitButton.addEventListener(
    "click",
    submitAnswer
  );

});
