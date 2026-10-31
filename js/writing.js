
// =========================
// 英作文問題データ
// =========================

// 問題の系統・難易度・問題文を管理します。

const questionBank = [

  // -------------------------
  // 日常英会話
  // -------------------------

  {
    id: 1,
    category: "日常英会話",
    difficulty: "易しい",
    question: "私は毎朝7時に起きます。"
  },
  {
    id: 2,
    category: "日常英会話",
    difficulty: "普通",
    question: "あなたは昨日、何時に家に帰りましたか。"
  },
  {
    id: 3,
    category: "日常英会話",
    difficulty: "やや難しい",
    question: "私は子どものころ、よく公園で友達と遊んでいました。"
  },
  {
    id: 4,
    category: "日常英会話",
    difficulty: "難しい",
    question: "もし明日晴れたら、友達と一緒に買い物に行こうと思っています。"
  },

  // -------------------------
  // 学校生活
  // -------------------------

  {
    id: 5,
    category: "学校生活",
    difficulty: "易しい",
    question: "私は毎日学校へ行きます。"
  },
  {
    id: 6,
    category: "学校生活",
    difficulty: "普通",
    question: "私の友達は英語を勉強するために図書館へ行きました。"
  },
  {
    id: 7,
    category: "学校生活",
    difficulty: "やや難しい",
    question: "私は昨日、先生が授業で説明した内容を理解できませんでした。"
  },
  {
    id: 8,
    category: "学校生活",
    difficulty: "難しい",
    question: "毎日少しずつ努力することが、目標を達成するために最も重要だと私は思います。"
  },

  // -------------------------
  // 旅行・文化
  // -------------------------

  {
    id: 9,
    category: "旅行・文化",
    difficulty: "易しい",
    question: "私は京都を訪れたいです。"
  },
  {
    id: 10,
    category: "旅行・文化",
    difficulty: "普通",
    question: "日本を訪れる外国人観光客の数は増えています。"
  },
  {
    id: 11,
    category: "旅行・文化",
    difficulty: "やや難しい",
    question: "日本の文化について外国の人々に紹介することは、とても興味深いです。"
  },
  {
    id: 12,
    category: "旅行・文化",
    difficulty: "難しい",
    question: "異なる文化を持つ人々と交流することによって、私たちは自分の考え方を広げることができます。"
  },

  // -------------------------
  // その他
  // -------------------------

  {
    id: 13,
    category: "その他",
    difficulty: "易しい",
    question: "私は犬が好きです。"
  },
  {
    id: 14,
    category: "その他",
    difficulty: "普通",
    question: "私は環境を守るために、できることをしたいです。"
  },
  {
    id: 15,
    category: "その他",
    difficulty: "やや難しい",
    question: "インターネットは私たちの生活を便利にしましたが、いくつかの問題も引き起こしています。"
  },
  {
    id: 16,
    category: "その他",
    difficulty: "難しい",
    question: "科学技術が急速に発展する現代社会において、私たちはその利点だけでなく、問題点についても考える必要があります。"
  }

];


// =========================
// 問題作成機能
// =========================

document.addEventListener("DOMContentLoaded", () => {

  const generateButton =
    document.getElementById("generate-question");

  const anotherButton =
    document.getElementById("another-question");

  const resultArea =
    document.getElementById("question-result");

  const errorMessage =
    document.getElementById("filter-error");

  const questionNumber =
    document.getElementById("question-number");

  const questionCategory =
    document.getElementById("question-category");

  const questionDifficulty =
    document.getElementById("question-difficulty");

  const questionText =
    document.getElementById("question-text");


  // 出題回数
  let questionCount = 0;

  // 直前に出題した問題
  let previousQuestionId = null;


  // =========================
  // 選択された条件を取得
  // =========================

  function getSelectedValues(name) {

    const checkedItems = document.querySelectorAll(
      `input[name="${name}"]:checked`
    );

    return Array.from(checkedItems).map(
      (item) => item.value
    );

  }


  // =========================
  // 問題を作成
  // =========================

  function generateQuestion() {

    // 選択された系統
    const selectedCategories =
      getSelectedValues("category");

    // 選択された難易度
    const selectedDifficulties =
      getSelectedValues("difficulty");


    // 未選択の場合
    if (
      selectedCategories.length === 0 ||
      selectedDifficulties.length === 0
    ) {

      errorMessage.hidden = false;
      resultArea.hidden = true;

      return;
    }

    errorMessage.hidden = true;


    // 条件に合う問題を抽出
    let availableQuestions = questionBank.filter(
      (question) => {

        const categoryMatch =
          selectedCategories.includes(question.category);

        const difficultyMatch =
          selectedDifficulties.includes(question.difficulty);

        return categoryMatch && difficultyMatch;

      }
    );


    // 条件に合う問題がない場合
    if (availableQuestions.length === 0) {

      errorMessage.textContent =
        "選択した条件に合う問題がありません。";

      errorMessage.hidden = false;
      resultArea.hidden = true;

      return;
    }


    // 直前と同じ問題を避ける
    const otherQuestions = availableQuestions.filter(
      (question) =>
        question.id !== previousQuestionId
    );

    if (otherQuestions.length > 0) {
      availableQuestions = otherQuestions;
    }


    // ランダムに1問選択
    const randomIndex = Math.floor(
      Math.random() * availableQuestions.length
    );

    const selectedQuestion =
      availableQuestions[randomIndex];


    // 直前の問題を記録
    previousQuestionId = selectedQuestion.id;

    // 出題回数を増やす
    questionCount++;


    // =========================
    // 問題を画面に表示
    // =========================

    questionNumber.textContent =
      `第${questionCount}問`;

    questionCategory.textContent =
      selectedQuestion.category;

    questionDifficulty.textContent =
      selectedQuestion.difficulty;

    questionText.textContent =
      selectedQuestion.question;


    // 結果を表示
    resultArea.hidden = false;

    // 問題の位置までスクロール
    resultArea.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  }


  // =========================
  // ボタンの動作
  // =========================

  generateButton.addEventListener(
    "click",
    generateQuestion
  );

  anotherButton.addEventListener(
    "click",
    generateQuestion
  );

});
