document.addEventListener('DOMContentLoaded', function () {
    const quizContainer = document.getElementById('quiz-container');
    const reviewContainer = document.getElementById('review-container');
    const submitBtn = document.getElementById('submitBtn');
    const reviewBtn = document.getElementById('reviewBtn');
    const resultContainer = document.getElementById('result-container');
    const scoreText = document.getElementById('score-text');
    let quizData = []; 

    async function loadQuizData() {
        try {
            const response = await fetch('quiz_th.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            quizData = await response.json();
            buildQuiz();
        } catch (error) {
            quizContainer.innerHTML = `<p style="color: red;">เกิดข้อผิดพลาดในการโหลดข้อสอบ: ${error.message}</p>`;
        }
    }

    // [แก้ไข] สร้างข้อสอบบนหน้าเว็บ พร้อมปุ่ม 'ดูเฉลย' ประจำข้อ
    function buildQuiz() {
        quizContainer.innerHTML = ''; 
        quizData.forEach((data, index) => {
            const questionBlock = document.createElement('div');
            questionBlock.classList.add('question-block');
            questionBlock.id = `question-${index}`;

            const questionText = document.createElement('p');
            questionText.classList.add('question-text');
            questionText.textContent = `${index + 1}. ${data.question}`;
            questionBlock.appendChild(questionText);

            const choicesDiv = document.createElement('div');
            choicesDiv.classList.add('choices');

            data.choices.forEach(choice => {
                const label = document.createElement('label');
                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = `question${index}`;
                radio.value = choice;
                
                label.appendChild(radio);
                label.appendChild(document.createTextNode(` ${choice}`));
                choicesDiv.appendChild(label);
            });

            questionBlock.appendChild(choicesDiv);

            // --- ส่วนที่เพิ่มเข้ามา ---
            const footerDiv = document.createElement('div');
            footerDiv.classList.add('question-footer');

            const singleReviewBtn = document.createElement('button');
            singleReviewBtn.textContent = 'ดูคำตอบข้อนี้';
            singleReviewBtn.classList.add('show-answer-btn');
            // เพิ่ม attribute เพื่อระบุว่าเป็นปุ่มของข้อไหน
            singleReviewBtn.setAttribute('data-question-index', index);

            footerDiv.appendChild(singleReviewBtn);
            questionBlock.appendChild(footerDiv);
            // --- สิ้นสุดส่วนที่เพิ่ม ---

            quizContainer.appendChild(questionBlock);
        });
    }
    
    // [ฟังก์ชันใหม่] แสดงเฉลยเฉพาะข้อที่กด
    function revealSingleAnswer(questionIndex) {
        const questionData = quizData[questionIndex];
        const questionBlock = document.getElementById(`question-${questionIndex}`);
        const choices = questionBlock.querySelectorAll('.choices label');
        
        choices.forEach(label => {
            const choiceText = label.textContent.trim();
            // ไฮไลท์คำตอบที่ถูกต้อง
            if (choiceText === questionData.correctAnswer) {
                label.classList.add('revealed_answer');
            }
        });

        // ซ่อนปุ่มหลังจากกดเฉลยแล้ว
        const button = questionBlock.querySelector('.show-answer-btn');
        if(button) button.style.display = 'none';
    }

    // Event Delegation สำหรับปุ่มเฉลยแต่ละข้อ
    quizContainer.addEventListener('click', function(event) {
        // เช็คว่าสิ่งที่คลิกคือปุ่ม 'ดูเฉลย' หรือไม่
        if (event.target && event.target.classList.contains('show-answer-btn')) {
            const questionIndex = event.target.getAttribute('data-question-index');
            revealSingleAnswer(parseInt(questionIndex, 10));
        }
    });

    // ฟังก์ชันตรวจคำตอบและแสดงผล (เหมือนเดิม)
    function showResults() {
        let score = 0;
        reviewContainer.innerHTML = '<hr><h2>ทบทวนและดูเฉลย</h2>';
        // (เนื้อหาฟังก์ชันที่เหลือเหมือนเดิม...)

        quizData.forEach((data, index) => {
            const questionBlock = quizContainer.querySelector(`#question-${index}`);
            const selectedOption = questionBlock.querySelector(`input[name="question${index}"]:checked`);
            
            const reviewBlock = document.createElement('div');
            reviewBlock.classList.add('question-block', 'review');

            const questionText = document.createElement('p');
            questionText.classList.add('question-text');
            questionText.textContent = `${index + 1}. ${data.question}`;
            reviewBlock.appendChild(questionText);

            const choicesDiv = document.createElement('div');
            choicesDiv.classList.add('choices');
            
            let userAnswer = selectedOption ? selectedOption.value : null;
            let isCorrect = userAnswer === data.correctAnswer;

            data.choices.forEach(choice => {
                const label = document.createElement('label');
                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = `review${index}`;
                radio.value = choice;
                radio.disabled = true;

                label.appendChild(radio);
                label.appendChild(document.createTextNode(` ${choice}`));

                if (choice === data.correctAnswer) {
                    label.classList.add('correct-answer');
                }
                
                if (choice === userAnswer) {
                    radio.checked = true;
                    label.classList.add(isCorrect ? 'user-answer' : 'incorrect-user-answer');
                }
                choicesDiv.appendChild(label);
            });
            reviewBlock.appendChild(choicesDiv);

            if (isCorrect) {
                score++;
                const resultDiv = document.createElement('div');
                resultDiv.className = 'review-result correct';
                resultDiv.textContent = 'ตอบถูก ✔';
                reviewBlock.appendChild(resultDiv);
            } else {
                const resultDiv = document.createElement('div');
                resultDiv.className = 'review-result incorrect';
                resultDiv.textContent = 'ตอบผิด ✘';
                reviewBlock.appendChild(resultDiv);
            }
            reviewContainer.appendChild(reviewBlock);
        });

        resultContainer.classList.remove('hidden');
        reviewContainer.classList.remove('hidden');
        scoreText.textContent = `คุณได้ ${score} จาก ${quizData.length} คะแนน`;
        
        submitBtn.style.display = 'none'; 
        reviewBtn.style.display = 'none';

        window.scrollTo(0, 0);
    }
    
    // ฟังก์ชันแสดงเฉลยทั้งหมด (เหมือนเดิม)
    function showAnswerKey() {
        reviewContainer.innerHTML = '<hr><h2>เฉลยข้อสอบทั้งหมด</h2>';
        // (เนื้อหาฟังก์ชันที่เหลือเหมือนเดิม...)

        quizData.forEach((data, index) => {
            const reviewBlock = document.createElement('div');
            reviewBlock.classList.add('question-block', 'review');

            const questionText = document.createElement('p');
            questionText.classList.add('question-text');
            questionText.textContent = `${index + 1}. ${data.question}`;
            reviewBlock.appendChild(questionText);

            const choicesDiv = document.createElement('div');
            choicesDiv.classList.add('choices');
            
            data.choices.forEach(choice => {
                const label = document.createElement('label');
                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = `review${index}`;
                radio.value = choice;
                radio.disabled = true;

                label.appendChild(radio);
                label.appendChild(document.createTextNode(` ${choice}`));

                if (choice === data.correctAnswer) {
                    label.classList.add('correct-answer');
                    radio.checked = true;
                }
                
                choicesDiv.appendChild(label);
            });
            reviewBlock.appendChild(choicesDiv);
            reviewContainer.appendChild(reviewBlock);
        });

        reviewContainer.classList.remove('hidden');
        submitBtn.style.display = 'none'; 
        reviewBtn.style.display = 'none';

        window.scrollTo(0, 0); 
    }

    submitBtn.addEventListener('click', showResults);
    reviewBtn.addEventListener('click', showAnswerKey);
    
    loadQuizData();
});