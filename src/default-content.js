/**
 * The complete published content of the website.
 *
 * This is seeded into the database on first run. After that, the database is
 * the source of truth and everything here can be edited from /admin.
 * Nothing in this file is rendered directly on the public site.
 */

export const defaultContent = {
  site: {
    name: 'Rock Bottom',
    title: 'Rock Bottom – The Way Back | Mental Health Support',
    tagline: 'A hand reaching back, from someone who has been there.',
    metaDescription:
      'You are not alone. This will not last forever. There is a way back. Personal experience, gentle steps and UK mental health support for anyone at rock bottom.',
    contactEmail: '',
  },

  theme: {
    background: '#256353',
    surface: '#2b6c5a',
    surfaceSoft: '#327663',
    ink: '#fffdf8',
    muted: '#dcefe3',
    accent: '#ffd88f',
    sage: '#cdebd8',
    glow: '#97dcc0',
    paper: '#fdf9ef',
    paperInk: '#173d33',
  },

  ui: {
    skipToContent: 'Skip to content',
    menuLabel: 'Menu',
    homeLabel: 'Home',
    readDisclaimer: 'Read the full disclaimer',
    stepsMediaNumber: '10',
    stepsMediaLineOne: 'steps, in no particular order.',
    stepsMediaLineTwo: 'Take what helps. Leave the rest.',
    notSure: 'Not sure which one? Start here',
    visitWebsite: 'Visit',
    backToHomepage: 'Back to the homepage',
    lastUpdated: 'Last updated:',
    helpNowHeading: 'If you need help now',
    helpNowText:
      'If you feel unable to keep yourself safe, call 999 or go to your nearest A&E. For urgent mental health support in England, call NHS 111 and select the mental health option.',
    call999: 'Call 999',
    allEmergency: 'All emergency options',
    listenHeading: 'Someone to listen',
    listenText: 'Samaritans are there 24 hours a day, 365 days a year.',
    listenPhone: '116 123',
    seeSupport: 'See support organisations',
    rights: 'All rights reserved.',
    adminLabel: 'Admin',
    helpfulEyebrow: 'A small kindness',
    helpfulHeading: 'Did this help you today?',
    helpfulText:
      'If something on this page made today feel a little lighter, you can let me know. It is anonymous, and counted once per device.',
    helpfulButton: 'This helped me',
    helpfulThanks: 'Thank you. Your tap has been counted.',
    helpfulVotedLabel: 'Counted — thank you',
    helpfulCountLabel: 'people have found this helpful',
    helpfulCountOne: 'person has found this helpful',
    helpfulError: 'That could not be counted just now. Please try again.',
  },

  nav: {
    stepsLabel: 'The way back',
    supportLabel: 'Support',
    emergencyLabel: 'Need help now',
    faqLabel: 'Questions',
    startLabel: "I don't know where to start",
  },

  hero: {
    eyebrow: 'You are not alone',
    title: 'Rock Bottom – The Way Back',
    intro:
      'Sometimes life takes us somewhere we never expected to be. Your mind is racing, your body won’t settle, and even the simplest things can feel overwhelming.',
    primaryCta: 'Start your way back',
    secondaryCta: "I don't know where to start",
    scrollLabel: 'Breathe. You’re here. That’s enough for now.',
    image: '/images/hero-forest.jpg',
    imageAlt:
      'A still forest lake at first light, surrounded by tall evergreen trees and soft mist',
  },

  letter: {
    eyebrow: 'A note from me',
    heading: 'I’ve been where you are.',
    paragraphs: [
      'I’ve been there. I know how frightening, lonely and exhausting it can feel.',
      'I created this website to share some of the things that helped me find my way back.',
      'I’m not a medical professional, and I don’t have all the answers. But if something I’ve experienced and learned can help even one person feel less alone, then this website has served its purpose.',
      'You don’t need to figure everything out today.',
      'Let’s just start with one step.',
    ],
    signature: 'Someone who has been there',
  },

  disclaimer: {
    label: 'A gentle but important note',
    text:
      'IMPORTANT: This website shares personal experiences and things that have helped me. I am not a trained medical professional, and this content is not medical advice. If you are struggling with your mental health, please consider speaking to your GP or a qualified healthcare professional.',
    shortText: 'Personal experience, not medical advice.',
  },

  startHelper: {
    eyebrow: 'No plan needed',
    heading: 'I don’t know where to start',
    intro:
      'That’s okay. You don’t need to have the words, the answers or a plan. Choose whichever of these feels most possible right now.',
    options: [
      {
        icon: 'message',
        title: 'Talk to someone',
        text:
          'Reach out to a friend, a loved one or your GP — or call Samaritans on 116 123. You don’t need to have the perfect words. Just start talking.',
        actionLabel: 'See who can listen',
        actionHref: '#support',
      },
      {
        icon: 'shield',
        title: 'Find immediate support',
        text:
          'If you feel unable to keep yourself safe, call 999 or go to your nearest A&E. For urgent mental health support in England, call NHS 111 and choose the mental health option.',
        actionLabel: 'Get urgent help',
        actionHref: '#emergency',
      },
      {
        icon: 'footsteps',
        title: 'Take one small step',
        text:
          'You don’t have to fix everything today. Read through ten gentle things that helped me, and choose just one that feels possible.',
        actionLabel: 'Read the ten steps',
        actionHref: '#steps',
      },
    ],
    closeLabel: 'Close',
    textSupportHeading: 'Don’t feel like talking on the phone?',
    textSupportText: 'Send a simple text saying SHOUT to 85258 to get support.',
    textSupportAction: 'Text 85258',
    textSupportNumber: '85258',
  },

  symptoms: {
    eyebrow: 'You are not the only one',
    heading: 'Does any of this sound familiar?',
    subtitle:
      'Sometimes it helps just to know that what you’re experiencing isn’t something you’re going through alone. These are some of the things I experienced when I was at rock bottom.',
    items: [
      { icon: 'wind', title: 'Mind racing' },
      { icon: 'repeat', title: 'Repetitive thoughts' },
      { icon: 'waves', title: 'Unable to relax' },
      { icon: 'droplet', title: 'Crying unexpectedly' },
      { icon: 'cloud', title: 'Overwhelming sadness' },
      { icon: 'heart-pulse', title: 'Heart racing' },
      { icon: 'moon', title: 'Unable to sleep' },
      { icon: 'apple', title: 'Struggling to eat' },
      { icon: 'users', title: 'Unable to face talking to people' },
      { icon: 'hand', title: 'Sweaty palms' },
      { icon: 'compass', title: 'Feeling completely lost' },
      { icon: 'cloud-sun', title: 'Feeling like things will never get better' },
    ],
    closing:
      'If you recognise yourself in any of these, please know that you’re not alone. There is support available, and things can change.',
    note:
      'This list describes personal experiences. It is not a checklist, a diagnosis or a substitute for professional advice.',
  },

  daily: {
    eyebrow: 'A reminder for today',
    heading: 'One gentle thought to carry with you',
    note: 'A different reminder appears each day.',
    image: '/images/calm-lake.jpg',
    imageAlt: 'A still mountain lake at first light, with soft clouds resting on the peaks',
    messages: [
      'You don’t have to climb the whole mountain today. Just take the next step.',
      'You have survived every difficult day you have had so far. That is not a small thing.',
      'Rest is not a reward you have to earn. It is part of getting through.',
      'You don’t need to feel hopeful to keep going. Sometimes you just need to get to the next hour.',
      'Drink some water. Unclench your jaw. Take one slow breath. That counts.',
      'You are allowed to ask for help before you reach breaking point.',
      'A bad day is not a failed life.',
      'If all you did today was get through it, that is enough.',
      'You don’t have to explain yourself perfectly to deserve support.',
      'Feelings are not instructions. You don’t have to act on every thought.',
      'Go outside if you can. Five minutes of air is still five minutes of air.',
      'You are not a burden because you need someone. Humans need people.',
      'There is a version of your life where this feels lighter. You don’t have to see it yet.',
      'Be as kind to yourself as you would be to a friend in the same position.',
      'You don’t need to fix everything today. One small thing is enough.',
      'It’s okay if today is a survive day, not a thrive day.',
      'Your feelings are real. They are also not permanent.',
      'If you’re still here, you’re already doing something brave.',
      'You don’t have to be grateful for the pain. You can just get through it.',
      'Slow is still forward.',
      'You are allowed to take up space, even while you’re struggling.',
      'You don’t need to have the right words. Just start talking.',
      'Nobody expects you to be okay all the time. Not really.',
      'There are people who would rather hear from you at your worst than not hear from you at all.',
      'A walk doesn’t have to be long to change the air in your head.',
      'Your body may be trying to protect you, even when it feels like it is working against you.',
      'You don’t have to earn rest by being exhausted.',
      'Some days the bravest thing you can do is stay, and let someone sit with you.',
      'You are not behind. There is no schedule for being human.',
      'If you can’t see a way forward, borrow hope from someone else for a while.',
      'You have made it through 100% of your hardest days so far.',
      'Crying doesn’t mean you are weak. It means you have been carrying something heavy.',
      'There is no weakness in taking medication, going to therapy, or asking for help.',
      'Not every thought deserves your belief.',
      'Your life is not a problem to be solved today. Just stay with it.',
      'One phone call can be a whole day’s achievement.',
      'You are allowed to start again, even this late, even this tired.',
      'The way back is not a straight line. Turning around is still progress.',
      'Put down what you don’t have to carry today.',
      'You matter, not because of what you do, but because you are here.',
    ],
  },

  tips: {
    eyebrow: 'The way back',
    heading: 'Ten Things That Helped Me Find My Way Back',
    subtitle:
      'This is not a prescription or a to-do list. It is simply what helped me. Take what feels useful, leave what doesn’t, and move at your own pace.',
    image: '/images/ferns.jpg',
    imageAlt: 'A quiet forest path leading through tall trees towards soft morning light',
    items: [
      {
        icon: 'message',
        title: 'Talk to someone',
        summary: 'You don’t need the perfect words. You just need to start.',
        body: [
          'Whatever you’re going through, you need to talk to someone.',
          'A friend, a loved one, a colleague, your GP, Samaritans – whatever it is, please share how you’re feeling.',
          'Keeping everything locked inside can make things feel even more overwhelming.',
          'You don’t need to have the perfect words. Just start talking.',
          'This is one of the most important first steps.',
        ],
      },
      {
        icon: 'waves',
        title: 'Understand that this feeling can pass',
        summary: 'This moment is real, but it does not have to define your future.',
        body: [
          'Your mind is probably going into overdrive. Anxiety pulsing through you? Can’t relax or settle? Minutes feel like hours?',
          'I’ve been there.',
          'I’m here to tell you, in your moment of need, that feelings can change. This moment does not have to define your future.',
          'As difficult as it feels right now, things can get better.',
          'You don’t need to believe that completely today. Just try to leave a little room for the possibility.',
        ],
      },
      {
        icon: 'trees',
        title: 'Get outside',
        summary: 'Five minutes of air is still five minutes of air.',
        body: [
          'As much as you might not want to, try to get outside.',
          'Go for a walk. Find some nature, some greenery, somewhere peaceful.',
          'Start small if you need to. Five or ten minutes is a start. Build it up gradually over the coming weeks.',
          'Try to make it consistent.',
          'Whatever has happened, give yourself opportunities to experience moments of calm again.',
          'You don’t have to walk for miles. Just getting outside can be a positive first step.',
        ],
      },
      {
        icon: 'droplet',
        title: 'Water, water, water',
        summary: 'When everything feels hard, start with the basics.',
        body: [
          'When you’re struggling, it’s easy to forget about the basics.',
          'Make sure you’re drinking enough water throughout the day.',
          'Look after your body, especially when you’re not feeling yourself.',
          'There isn’t one perfect amount for everyone, so don’t put unnecessary pressure on yourself to hit a particular target.',
          'Just remember to keep hydrated.',
        ],
      },
      {
        icon: 'coffee',
        title: 'Review stimulants and habits',
        summary: 'Notice what you’re putting into your body — gently.',
        body: [
          'Take a look at what you’re putting into your body.',
          'Caffeine, alcohol, nicotine and other stimulants can affect how you feel, particularly when you’re already experiencing anxiety.',
          'Consider whether any of these might be making things worse.',
          'Don’t suddenly stop alcohol, nicotine or prescribed medication without appropriate advice, as withdrawal can be harmful.',
          'Speak to your GP or another healthcare professional about making changes safely.',
        ],
        note:
          'Please speak to a healthcare professional before stopping prescribed medication, alcohol or nicotine suddenly.',
      },
      {
        icon: 'stethoscope',
        title: 'Book an appointment with your doctor',
        summary: 'You don’t have to pretend you’re okay.',
        body: [
          'Please don’t underestimate how important this step can be.',
          'Book an appointment with your GP and explain honestly how you’re feeling.',
          'You don’t have to pretend you’re okay.',
          'There may be different options available to help you, including talking therapies, counselling and medication where appropriate.',
          'You don’t have to work this out on your own.',
          'If you feel unable to keep yourself safe, seek emergency help rather than waiting for a routine appointment.',
        ],
        note:
          'If you feel unable to keep yourself safe, call 999 or go to your nearest A&E.',
      },
      {
        icon: 'activity',
        title: 'Get moving',
        summary: 'Start wherever you are. Small and consistent beats everything at once.',
        body: [
          'Exercise might be the last thing on your mind right now.',
          'But try to introduce some movement into your day.',
          'It could be walking, cycling, swimming, going to the gym or simply getting out of the house.',
          'Don’t put pressure on yourself to achieve anything impressive.',
          'Start wherever you are.',
          'Small, consistent steps are more important than trying to do everything at once.',
        ],
      },
      {
        icon: 'palette',
        title: 'Find something that gives you enjoyment',
        summary: 'You don’t need to feel motivated first. Just make a little space.',
        body: [
          'Where you are right now, you probably don’t feel like doing anything.',
          'But it’s important to try to reconnect with something that gives you a little enjoyment or calmness.',
          'Something creative. Something that takes your mind somewhere else.',
          'Piano, baking, gaming, reading, tennis, padel, painting, gardening – whatever your thing is.',
          'Try to make a little space for it.',
          'You don’t need to feel motivated first. Sometimes you just need to gently give yourself the opportunity.',
        ],
      },
      {
        icon: 'heart',
        title: 'Don’t be afraid to cry',
        summary: 'There is no weakness in showing emotion.',
        body: [
          'If you’re anything like me, you might find yourself feeling weepy a lot of the time.',
          'I certainly did.',
          'Don’t be afraid to let those emotions out.',
          'You don’t need to hold everything together all the time.',
          'If you need to cry, cry. If you need to talk, talk.',
          'There is no weakness in showing emotion.',
          'Be kind to yourself and allow yourself to feel what you’re feeling.',
        ],
      },
      {
        icon: 'sunrise',
        title: 'Be kind to yourself – there is a way forward',
        summary: 'You don’t need to have everything figured out. Just take the next step.',
        body: [
          'I know it feels impossible right now.',
          'I know you might not be able to see a way forward.',
          'But there is hope.',
          'I’ve been where you are, and I want you to know that things can change.',
          'It might take time. There might be difficult days along the way. You don’t have to rush the process.',
          'Be kind to yourself.',
          'Treat yourself with the same compassion you would show a friend or someone you love.',
          'You don’t need to have everything figured out.',
          'Just take the next step.',
          'There is a way forward, and you deserve the opportunity to find it.',
        ],
      },
    ],
    closingHeading: 'That’s the whole list. No pressure to do it all.',
    closingText:
      'Choose one thing. The smallest thing. If today only holds one of these, let it be enough.',
  },

  support: {
    eyebrow: 'You are never alone',
    heading: 'Someone Is Always There To Listen',
    subtitle:
      'These UK organisations offer free, confidential support. You don’t have to be in crisis to reach out. Talking to someone early can make a real difference.',
    checkedLabel: 'Contact details checked: November 2026',
    organisations: [
      {
        name: 'Samaritans',
        mark: 'S',
        colour: '#3f8c6e',
        description:
          'Free, confidential listening support for anyone struggling to cope, whatever you’re going through. You can call at any time, day or night.',
        phone: '116 123',
        phoneHref: '116123',
        textLabel: '',
        textHref: '',
        hours: '24 hours a day, 365 days a year',
        website: 'https://www.samaritans.org/',
        websiteLabel: 'samaritans.org',
      },
      {
        name: 'Mind',
        mark: 'mind',
        colour: '#2f5fa8',
        description:
          'Information and signposting about mental health, support options and your rights, plus practical guidance for everyday wellbeing.',
        phone: '0300 102 1234',
        phoneHref: '03001021234',
        textLabel: '',
        textHref: '',
        hours: 'Monday to Friday, 9am–6pm, excluding bank holidays',
        website: 'https://www.mind.org.uk/',
        websiteLabel: 'mind.org.uk',
      },
      {
        name: 'CALM – Campaign Against Living Miserably',
        mark: 'CALM',
        colour: '#d8aa54',
        description:
          'Support for anyone who is struggling with life, including people who are suicidal or bereaved by suicide. Call the helpline or use the webchat.',
        phone: '0800 58 58 58',
        phoneHref: '0800585858',
        textLabel: '',
        textHref: '',
        hours: 'Every day, 5pm–midnight',
        website: 'https://www.thecalmzone.net/',
        websiteLabel: 'thecalmzone.net',
      },
      {
        name: 'Shout',
        mark: 'shout',
        colour: '#2a9d8f',
        description:
          'Free, confidential, 24/7 text support for anyone in crisis, staffed by trained volunteers. If speaking feels impossible, you can text instead.',
        phone: '',
        phoneHref: '',
        textLabel: 'Text SHOUT to 85258',
        textHref: '85258',
        hours: '24 hours a day, 7 days a week',
        website: 'https://giveusashout.org/',
        websiteLabel: 'giveusashout.org',
      },
      {
        name: 'SANE',
        mark: 'SANE',
        colour: '#7557a3',
        description:
          'Emotional support and information for anyone affected by mental illness, including carers, families and friends.',
        phone: '0300 304 7000',
        phoneHref: '03003047000',
        textLabel: '',
        textHref: '',
        hours: 'Every day, 4pm–10pm',
        website: 'https://www.sane.org.uk/',
        websiteLabel: 'sane.org.uk',
      },
    ],
    note:
      'Opening hours and contact details can change. Please check the organisation’s official website before relying on them. These services are operated independently of Rock Bottom – The Way Back. If you are in immediate danger, call 999.',
  },

  emergency: {
    eyebrow: 'Please don’t wait',
    heading: 'If You Need Help Right Now',
    intro:
      'If you feel unable to keep yourself safe, or someone else’s life is at risk, please call 999 or go to your nearest A&E department. If you need urgent mental health support in England, call NHS 111 and select the mental health option.',
    note:
      'You do not have to wait until things become unbearable before asking for help. If you are outside England, please use your local emergency number or urgent mental health service.',
    cards: [
      {
        label: 'Immediate danger',
        value: '999',
        href: 'tel:999',
        actionLabel: 'Call 999',
        note: 'If you or someone else is in immediate danger.',
      },
      {
        label: 'Urgent mental health support · England',
        value: 'NHS 111',
        href: 'tel:111',
        actionLabel: 'Call 111',
        note: 'Select the mental health option when prompted.',
      },
      {
        label: 'Nearest emergency department',
        value: 'A&E',
        href: 'https://www.nhs.uk/service-search/other-health-services/urgent-and-emergency-care-services',
        actionLabel: 'Find A&E',
        note: 'Go to your nearest A&E if you feel unable to keep yourself safe.',
        external: true,
      },
      {
        label: 'Someone to talk to now',
        value: '116 123',
        href: 'tel:116123',
        actionLabel: 'Call Samaritans',
        note: 'Free and confidential, 24 hours a day.',
      },
    ],
  },

  community: {
    eyebrow: 'A community of people who understand',
    heading: 'You Don’t Have To Go Through This Alone',
    paragraphs: [
      'Sometimes it helps to speak to people who understand what you’re experiencing.',
      'There are communities out there where people share experiences, support one another and offer a listening ear.',
      'You don’t have to face everything alone.',
    ],
    buttonLabel: 'Visit the mental health community',
    url: 'https://www.mentalhealthforum.net/forum/',
    disclaimer:
      'This link opens an independently operated external forum in a new tab. Rock Bottom – The Way Back does not run or moderate this community, and its moderation, privacy and safety arrangements are outside our control. Please read their rules and privacy information before taking part.',
    image: '/images/sunrise-path.jpg',
    imageAlt: 'A single broad tree standing in a sunlit field beneath a wide open sky',
  },

  faq: {
    eyebrow: 'Questions people ask',
    heading: 'Where to go when you are not sure where to start',
    intro:
      'When everything feels overwhelming, even finding the right kind of help can feel like too much. These are some of the questions people ask most often. There are no stupid questions here.',
    note:
      'This page is signposting and personal experience, not medical advice. If you or someone else is in immediate danger, call 999 or go to A&E.',
    items: [
      {
        question: 'I feel like I’m at rock bottom. What can I do today?',
        answer:
          'You do not have to solve everything at once. Pick one small thing: breathe slowly, drink some water, step outside, or message one person you trust. If you feel unsafe or are thinking about harming yourself, please use the emergency options now. You deserve support today, not only when things feel unbearable.',
        linkLabel: 'Start with one small step',
        linkHref: '/#start-helper',
      },
      {
        question: 'How do I get mental health support in the UK when I don’t know where to start?',
        answer:
          'You can speak to your GP, call NHS 111 and choose the mental health option, or contact one of the UK helplines. You do not need the perfect words or a diagnosis to ask for help. If you are not sure which service fits, start with Samaritans or Mind and they can point you in the right direction.',
        linkLabel: 'See the UK support options',
        linkHref: '/#support',
      },
      {
        question: 'What mental health helplines and text services can I contact?',
        answer:
          'Samaritans: 116 123, free, 24/7. Mind: 0300 102 1234, Monday to Friday, 9am–6pm (excluding bank holidays). CALM: 0800 58 58 58, daily 5pm–midnight. Shout: text SHOUT to 85258, 24/7. SANE: 0300 304 7000, daily 4pm–10pm. Opening hours can change, so check the organisation’s website if you can.',
        linkLabel: 'See full support details and websites',
        linkHref: '/#support',
      },
      {
        question: 'What should I say when I call a helpline?',
        answer:
          'You do not need a script. “I don’t know where to start” is enough. You can say how you are feeling, what has been happening, or simply that you need someone to listen. The person on the other end will help guide the conversation, and you can stop or take a break at any time.',
        linkLabel: 'Find someone to listen',
        linkHref: '/#support',
      },
      {
        question: 'Everything feels too much. What is one small step?',
        answer:
          'Choose the smallest possible next step: take three slow breaths, put your feet on the floor, drink a glass of water, open a window, or send one message to someone safe. You are not failing because you cannot do everything. One small step still counts as movement.',
        linkLabel: 'Try the ten gentle steps',
        linkHref: '/#steps',
      },
      {
        question: 'How can I support a friend who is struggling?',
        answer:
          'Ask how they are, listen without trying to fix everything, and let them know they are not a burden. You can help with practical things, encourage them to speak to a GP or a helpline, and keep checking in. If you believe they are in immediate danger, call 999 or stay with them while you get help.',
        linkLabel: 'Emergency help and what to do',
        linkHref: '/#emergency',
      },
      {
        question: 'Where can I find free or low-cost mental health support?',
        answer:
          'Start with your GP or NHS 111 for NHS support. Mind has information and signposting, Hub of Hope lists local services, and many local Mind groups, charities, universities and workplaces offer free or low-cost help. Waiting lists vary, so it is okay to ask about several routes at once.',
        linkLabel: 'Find local services on Hub of Hope',
        linkHref: 'https://hubofhope.co.uk/',
      },
      {
        question: 'Does faith or prayer help with mental health?',
        answer:
          'For some people, faith and prayer are a real source of comfort and hope. This site includes a gentle, optional invitation to ask Jesus for help. It is never a requirement, and prayer is not a substitute for professional care or emergency help. You are welcome exactly as you are.',
        linkLabel: 'Read the gentle faith invitation',
        linkHref: '/#faith',
      },
      {
        question: 'Is this website medical advice?',
        answer:
          'No. This website shares one person’s lived experience and signposts to UK support. It is not medical advice, diagnosis or treatment, and it does not replace a doctor, therapist or crisis service. If you are worried about your health, please speak to a qualified professional.',
        linkLabel: 'Read the full disclaimer',
        linkHref: '/disclaimer',
      },
      {
        question: 'What if I need help right now?',
        answer:
          'If you or someone else is in immediate danger, call 999 or go to your nearest A&E. For urgent mental health support in England, call NHS 111 and choose the mental health option. Samaritans are available on 116 123, 24 hours a day. Please do not wait until things feel unbearable.',
        linkLabel: 'Emergency help now',
        linkHref: '/#emergency',
      },
      {
        question: 'Where can I talk to other people who understand?',
        answer:
          'There are communities where people share experiences and support one another. The mental health forum linked below is independently operated, so please read its rules and privacy information before taking part. It is not run or moderated by this website.',
        linkLabel: 'Visit the mental health community',
        linkHref: '/#community',
      },
      {
        question: 'Can I use this site outside the UK?',
        answer:
          'Yes, but the support details and helplines are UK-focused. If you are outside the UK, use your local emergency number and local mental health services. The rest of the site — the personal experience and gentle steps — is here for anyone who needs it.',
        linkLabel: 'See the support options',
        linkHref: '/#support',
      },
    ],
  },

  faith: {
    eyebrow: 'A gentle invitation',
    heading: 'You are welcome to ask Jesus for help',
    text:
      'Whether you’re religious or not, I would also invite you to ask Jesus for help in your current situation. You’ll be surprised how much this can help. Just say one simple prayer for help and guidance — no pressure.',
    note:
      'This is a personal invitation, not a requirement. Prayer is not a substitute for professional care or emergency help. The link opens an independent Bible study website in a new tab.',
    linkLabel: 'Read Bible verses about Jesus always being with us',
    url: 'https://biblestudyforyou.com/bible-verses-about-jesus-always-being-with-us/',
  },

  donation: {
    eyebrow: 'Optional support',
    heading: 'Help keep this website running',
    text:
      'This website is free to use, and it always will be. If you would like to help with hosting and running costs, you can buy me a coffee on Ko-fi. It is completely optional.',
    buttonLabel: 'Support the site on Ko-fi',
    url: 'https://ko-fi.com/rockbottomthewayback',
    note: 'Opens Ko-fi in a new tab. Donations are optional and do not unlock any content.',
  },

  visitor: {
    label: 'People who have visited this page',
    note: 'Counted anonymously, once per device.',
  },

  closing: {
    eyebrow: 'One last thing',
    heading: 'You might be at rock bottom today.',
    text:
      'But this doesn’t have to be where your story ends. You don’t need to have everything figured out. Just take the next step.',
    buttonLabel: 'Start your way back',
  },

  footer: {
    message:
      'Wherever you are right now, whatever you’re going through, please remember that you matter.',
    closing: 'One step at a time. One day at a time. There is a way back.',
    copyright: 'Rock Bottom – The Way Back',
    disclaimerLabel: 'Disclaimer',
    privacyLabel: 'Privacy',
    supportLabel: 'Support organisations',
    faqLabel: 'Questions answered',
    forumLabel: 'Mental health forum',
    emergencyNote: 'If you need urgent help, call 999 or NHS 111 (England).',
    credits: 'Photography via Unsplash.',
  },

  pages: {
    disclaimer: {
      title: 'Disclaimer',
      updated: 'November 2026',
      intro:
        'This website is a personal project. It shares lived experience and things that have helped one person. It is not a medical service.',
      sections: [
        {
          heading: 'Not medical advice',
          paragraphs: [
            'The content on Rock Bottom – The Way Back is for general information and peer support only. It is not medical advice, diagnosis or treatment, and it should not be used as a substitute for advice from a doctor, therapist or other qualified healthcare professional.',
            'I am not a trained medical professional. Everyone’s circumstances are different, and what helped me may not be right for you.',
          ],
        },
        {
          heading: 'If you need help now',
          paragraphs: [
            'If you feel unable to keep yourself safe, or someone else’s life is at risk, call 999 or go to your nearest A&E department. If you need urgent mental health support in England, call NHS 111 and select the mental health option.',
            'You do not have to wait until things become unbearable before asking for help.',
          ],
        },
        {
          heading: 'Support organisations and external links',
          paragraphs: [
            'Contact details and opening hours for support organisations are checked periodically, but they can change. Please confirm details on the organisation’s official website. Support organisations and the external forum are independently operated and are not controlled by this website.',
            'Following a link to another website is at your own discretion. Their content, privacy practices and moderation arrangements are their responsibility, not ours.',
          ],
        },
        {
          heading: 'No guarantee',
          paragraphs: [
            'I share what I have learned in good faith, but I cannot guarantee that any suggestion will work for you or that it is suitable for your situation. Please seek personalised advice from a qualified professional.',
          ],
        },
      ],
    },
    privacy: {
      title: 'Privacy',
      updated: 'November 2026',
      intro:
        'This website is designed to collect as little information about you as possible. You should not have to hand over personal data to read a page that might help.',
      sections: [
        {
          heading: 'What we count',
          paragraphs: [
            'We keep a simple, anonymous visitor count so the site owner can see whether the website is reaching people. A random identifier is stored in a first-party cookie on your device. We store only a one-way hash of that identifier, together with the page visited and the time of the visit. We do not store your name, email address, IP address, location or anything you read.',
            'The count is used only in aggregate: total visitors, page views and daily totals. It is not used to build a profile of you, and it is never sold or shared for advertising.',
          ],
        },
        {
          heading: 'Cookies we use',
          paragraphs: [
            'A visitor cookie lets us recognise a returning device so refreshing the page does not inflate the visitor count. It lasts up to one year. A security cookie protects forms, and an administrator session cookie is set only when the site owner signs in. We use no advertising, social media or third-party analytics cookies.',
          ],
        },
        {
          heading: 'Administrator information',
          paragraphs: [
            'The administrator account stores a username and a securely hashed password. Passwords are never stored in plain text. Sessions expire automatically, and the administrator can sign out at any time.',
          ],
        },
        {
          heading: 'External websites',
          paragraphs: [
            'This website links to external support organisations and an independently operated forum. Once you leave this site, their privacy policies apply. Please read them before sharing personal information.',
          ],
        },
        {
          heading: 'Your choices and questions',
          paragraphs: [
            'You can clear or block cookies in your browser; the website will still be readable, although the visitor count may treat your device as new. If you have a question about this notice, please contact the website owner using the contact details they publish on this site.',
          ],
        },
      ],
    },
  },
};
