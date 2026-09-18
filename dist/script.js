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
const links=window.BOOKING_LINKS||{};
function validBookingUrl(value,hosts){
  try{const url=new URL(value);return url.protocol==='https:'&&hosts.some(host=>url.hostname===host||url.hostname.endsWith(`.${host}`))?url.href:null}catch{return null}
}
const consultationUrl=validBookingUrl(links.consultation,['cal.id']);
function renderWebinarForm(){
  body.innerHTML=`<div class="quiz-kicker">LIVE HINDI WEBINAR</div><h2 id="quiz-title">Get webinar details on WhatsApp.</h2><p class="result-copy">Enter your details to request a place. Your WhatsApp number is required so the clinic can send the joining information and reminders.</p><form id="webinar-form"><label for="webinar-name">Your name <span aria-hidden="true">*</span></label><input id="webinar-name" name="name" autocomplete="name" required minlength="2" maxlength="100"><label for="webinar-phone">WhatsApp number <span aria-hidden="true">*</span></label><div class="phone-field"><span>+91</span><input id="webinar-phone" name="phone" type="tel" autocomplete="tel-national" inputmode="numeric" pattern="[6-9][0-9]{9}" maxlength="10" placeholder="10-digit mobile number" required></div><label for="webinar-email">Email address <small>(optional)</small></label><input id="webinar-email" name="email" type="email" autocomplete="email" maxlength="254"><label class="consent"><input type="checkbox" name="consent" required><span>I agree to receive webinar confirmation and reminders on WhatsApp.</span></label><button class="button button-dark" type="submit">Request webinar registration <span aria-hidden="true">↗</span></button></form><p class="result-small">This is a design preview. Details entered here are not yet saved or sent to the clinic.</p>`;
  body.querySelector('#webinar-form').addEventListener('submit',event=>{
    event.preventDefault();
    const form=event.currentTarget;
    if(!form.reportValidity())return;
    const phone=form.elements.phone.value.replace(/\D/g,'');
    if(!/^[6-9]\d{9}$/.test(phone)){form.elements.phone.setCustomValidity('Enter a valid 10-digit Indian WhatsApp number.');form.reportValidity();return}
    body.innerHTML=`<div class="quiz-kicker">WEBINAR REQUEST PREVIEW</div><h2 id="quiz-title">This is how confirmation will appear.</h2><p class="result-copy" id="confirmation-copy"></p><button class="button button-dark" type="button" id="restart">Start again <span aria-hidden="true">↗</span></button><p class="result-small">This preview has not saved your details or registered you for the webinar.</p>`;
    body.querySelector('#confirmation-copy').textContent=`Thank you, ${form.elements.name.value.trim()}. Once registration is connected, joining details will be sent to your WhatsApp number.`;
    body.querySelector('#restart').addEventListener('click',()=>{step=0;answers=[];render()});
  });
  body.querySelector('#webinar-phone').addEventListener('input',event=>event.currentTarget.setCustomValidity(''));
}
function openQuiz(){step=0;answers=[];render();dialog.showModal();document.body.style.overflow='hidden'}
function closeQuiz(){dialog.close();document.body.style.overflow=''}
function render(){
  bar.style.width=`${step/questions.length*100}%`;
  if(step>=questions.length){
    const urgent=answers[3]===0||answers[4]>=2||answers[1]>=2;
    if(!urgent){bar.style.width='100%';renderWebinarForm();return}
    const action=consultationUrl?`<a class="button button-dark" href="${consultationUrl}" target="_blank" rel="noopener noreferrer">Choose a consultation time on Cal.id <span aria-hidden="true">↗</span></a>`:`<p class="booking-pending">The Cal.id booking link will be added here once confirmed.</p>`;
    body.innerHTML=`<div class="quiz-kicker">YOUR SUGGESTED NEXT STEP</div><h2 id="quiz-title">A personal consultation may be a useful start.</h2><p class="result-copy">Your answers suggest that a direct conversation with Dr. Surabhi could help you discuss your situation and suitable options. The proposed consultation is at the clinic in Thane.</p>${action}<button class="back restart" type="button" id="restart">Explore again</button><p class="result-small">This short questionnaire is a guide to a next step, not a diagnosis. If you have urgent or rapidly worsening symptoms, seek prompt medical evaluation.</p>`;
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

const storyVideos=new Set(['wrwncuc7zz8','s_OgsH07lCQ','vOP7CtT9VGQ']);
document.querySelectorAll('.story-image[data-video-id]').forEach(button=>{
  button.addEventListener('click',()=>{
    const id=button.dataset.videoId;
    if(!storyVideos.has(id))return;
    document.querySelectorAll('.story-media iframe').forEach(player=>{
      const poster=player._poster;
      if(poster)player.replaceWith(poster);
    });
    const player=document.createElement('iframe');
    player.src=`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
    player.title=button.getAttribute('aria-label');
    player.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    player.allowFullscreen=true;
    player.referrerPolicy='strict-origin-when-cross-origin';
    player._poster=button;
    button.replaceWith(player);
    player.focus();
  });
});
