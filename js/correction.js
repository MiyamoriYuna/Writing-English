
document.addEventListener("DOMContentLoaded", () => {

  const answerInput = document.getElementById("answer-input");
  const answerCount = document.getElementById("answer-count");
  const submitButton = document.getElementById("submit-answer");
  const answerError = document.getElementById("answer-error");
  const resultArea = document.getElementById("correction-result");

  // 文字数表示
  answerInput.addEventListener("input", () => {
    answerCount.textContent = `${answerInput.value.length}文字`;
  });

  // 間違いを表示する
  function displayErrors(elementId, errors) {
    const container = document.getElementById(elementId);
    container.replaceChildren();

    if (errors.length === 0) {
      const message = document.createElement("p");
      message.className = "no-error";
      message.textContent = "この項目に間違いはありません。";
      container.appendChild(message);
      return;
    }

    errors.forEach(error => {
      const item = document.createElement("div");
      item.className = "error-item";

      const original = document.createElement("p");
      original.className = "error-original";
      original.textContent = `間違い：${error.original}`;

      const corrected = document.createElement("p");
      corrected.className = "error-correct";
      corrected.textContent = `正しい表現：${error.corrected}`;

      const explanation = document.createElement("p");
      explanation.className = "error-explanation";
      explanation.textContent = `解説：${error.explanation}`;

      item.append(original, corrected, explanation);
      container.appendChild(item);
    });
  }

  // 仮の添削処理
  function checkAnswer(answer) {

    const result = {
      overallComment: "仮の添削機能によるチェック結果です。",
      correctedAnswer: answer,
      spellingErrors: [],
      grammarErrors: [],
      structureErrors: [],
      alternatives: []
    };

    // スペルチェック
    if (/\bstuding\b/i.test(answer)) {
      result.spellingErrors.push({
        original: "studing",
        corrected: "studying",
        explanation: "study に ing を付ける場合、y を i に変えてから ing を付けます。"
      });

      result.correctedAnswer =
        result.correctedAnswer.replace(/\bstuding\b/gi, "studying");
    }

    // 三人称単数のチェック
    if (/\bHe play tennis\.?/i.test(answer)) {
      result.grammarErrors.push({
        original: "He play tennis.",
        corrected: "He plays tennis.",
        explanation: "主語が三人称単数の現在形では、一般動詞に s を付けます。"
      });

      result.correctedAnswer =
        result.correctedAnswer.replace(/\bHe play tennis\.?/gi, "He plays tennis.");
    }

    // very の位置のチェック
    if (/\bI very like music\.?/i.test(answer)) {
      result.structureErrors.push({
        original: "I very like music.",
        corrected: "I like music very much.",
        explanation: "very は一般動詞の like を直接修飾できません。very much を使います。"
      });

      result.correctedAnswer =
        result.correctedAnswer.replace(/\bI very like music\.?/gi, "I like music very much.");
    }

    return result;
  }

  // 学習リストに保存
  async function saveCorrectionErrors(data) {

    const groups = [
      { type: "spelling", errors: data.spellingErrors },
      { type: "grammar", errors: data.grammarErrors },
      { type: "structure", errors: data.structureErrors }
    ];

    for (const group of groups) {
      for (const error of group.errors) {
        await saveLearningItem({
          type: group.type,
          original: error.original,
          corrected: error.corrected,
          explanation: error.explanation
        });
      }
    }
  }

  // 添削結果の表示
  async function displayCorrection(data) {

    document.getElementById("overall-comment").textContent =
      data.overallComment;

    document.getElementById("corrected-answer").textContent =
      data.correctedAnswer;

    displayErrors("spelling-errors", data.spellingErrors);
    displayErrors("grammar-errors", data.grammarErrors);
    displayErrors("structure-errors", data.structureErrors);

    const alternativeContainer =
      document.getElementById("alternative-expressions");

    alternativeContainer.replaceChildren();

    if (data.alternatives.length === 0) {
      const message = document.createElement("p");
      message.className = "no-error";
      message.textContent = "言い換え表現はありません。";
      alternativeContainer.appendChild(message);
    }

    // 学習リストに保存
    await saveCorrectionErrors(data);

    resultArea.hidden = false;
    resultArea.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  // 添削ボタン
  async function submitAnswer() {

    const answer = answerInput.value.trim();

    if (!answer) {
      answerError.textContent = "解答を入力してください。";
      answerError.hidden = false;
      return;
    }

    answerError.hidden = true;
    resultArea.hidden = true;

    submitButton.disabled = true;
    submitButton.textContent = "添削中...";

    try {
      // 仮の添削を実行
      const data = checkAnswer(answer);

      await displayCorrection(data);

    } catch (error) {
      console.error("添削エラー:", error);

      answerError.textContent =
        "添削結果の保存に失敗しました。データベースを確認してください。";

      answerError.hidden = false;

    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "添削する →";
    }
  }

  submitButton.addEventListener("click", submitAnswer);

});
