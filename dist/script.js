const dialog=document.querySelector('#quiz');
const body=document.querySelector('#quiz-body');
const bar=document.querySelector('#progress-bar');
const questions=[
  {title:'How long has your knee been troubling you?',options:['Less than a month','1 to 6 months','6 to 12 months','More than a year']},
  {title:'How much is it affecting everyday life?',options:['I can manage most activities','Walking or stairs are getting difficult','Several daily activities are difficult','I am concerned about my mobility']},
  {title:'What have you tried so far?',options:['I am just starting to explore','Medicines or painkillers','Physiotherapy, exercise or yoga','Several different treatments']},
  {title:'Has knee surgery been advised?',options:['Yes','No','I am not sure']},
  {title:'What are you hoping to do next?',options:['Understand my condition better','Explore treatment options','Speak with a doctor soon','I am ready to begin treatment']}
];
let step=0;let answers=[];
function openQuiz(){step=0;answers=[];render();dialog.showModal();document.body.style.overflow='hidden'}
function closeQuiz(){dialog.close();document.body.style.overflow=''}
function render(){
  bar.style.width=`${step/questions.length*100}%`;
  if(step>=questions.length){
    const urgent=answers[3]===0||answers[4]>=2||answers[1]>=2;
    body.innerHTML=`<div class="quiz-kicker">YOUR SUGGESTED NEXT STEP</div><h2 id="quiz-title">${urgent?'A personal consultation may be a useful start.':'A guided introduction may be a useful start.'}</h2><p class="result-copy">${urgent?'Your answers suggest that a direct conversation with Dr. Surabhi could help you discuss your situation and suitable options. The proposed consultation is at the clinic in Thane.':'A live Hindi webinar could help you understand common knee pain questions and prepare for a more informed conversation about your options.'}</p><button class="button button-dark" type="button" id="restart">Explore again <span aria-hidden="true">↗</span></button><p class="result-small">This preview does not assess your condition or book an appointment. If you have urgent or rapidly worsening symptoms, seek prompt medical evaluation.</p>`;
    body.querySelector('#restart').addEventListener('click',()=>{step=0;answers=[];render()});bar.style.width='100%';return;
  }
  const q=questions[step];
  body.innerHTML=`<div class="quiz-kicker">QUESTION ${String(step+1).padStart(2,'0')} OF ${String(questions.length).padStart(2,'0')}</div><h2 id="quiz-title">${q.title}</h2><div class="answers">${q.options.map((o,i)=>`<button type="button" class="answer${answers[step]===i?' selected':''}" data-answer="${i}">${o}</button>`).join('')}</div><div class="quiz-actions"><button type="button" class="back">${step?'← Previous question':'Close'}</button><span class="quiz-kicker">ABOUT 2 MINUTES</span></div>`;
  body.querySelectorAll('[data-answer]').forEach(btn=>btn.addEventListener('click',()=>{answers[step]=Number(btn.dataset.answer);step++;render()}));
  body.querySelector('.back').addEventListener('click',()=>{if(step){step--;render()}else closeQuiz()});
}
document.querySelectorAll('[data-start]').forEach(b=>b.addEventListener('click',openQuiz));
document.querySelector('.close').addEventListener('click',closeQuiz);
dialog.addEventListener('close',()=>{document.body.style.overflow=''});
