// frontend/src/assets/emojis.ts
// This is a direct port of the original emoji list.
// We are using a public path prefix `/emojis/` which Vite will handle correctly
// if you place your emoji images in the `public/emojis/` directory of your Vue project.

interface Emoji {
  shortcode: string;
  url: string;
}

export const emojiList: Emoji[] = [
  { shortcode: ':Facepalm:', url: '/emojis/Facepalm.png' },
  { shortcode: ':Grin:', url: '/emojis/Grin.png' },
  { shortcode: ':Chuckle:', url: '/emojis/Chuckle.png' },
  { shortcode: ':Awesome:', url: '/emojis/Awesome.png' },
  { shortcode: ':NoProb:', url: '/emojis/NoProb.png' },
  { shortcode: ':Laugh:', url: '/emojis/Laugh.png' },
  { shortcode: ':Cry:', url: '/emojis/Cry.png' },
  { shortcode: ':Angry:', url: '/emojis/Angry.png' },
  { shortcode: ':SillyFace:', url: '/emojis/SillyFace.png' },
  { shortcode: ':Sob:', url: '/emojis/Sob.png' },
  { shortcode: ':Bye:', url: '/emojis/Bye.png' },
  { shortcode: ':Wow:', url: '/emojis/Wow.png' },
  { shortcode: ':Funny:', url: '/emojis/Funny.png' },
  { shortcode: ':Kiss:', url: '/emojis/Kiss.png' },
  { shortcode: ':Clap:', url: '/emojis/Clap.png' },
  { shortcode: ':TearingUP:', url: '/emojis/TearingUP.png' },
  { shortcode: ':Trick:', url: '/emojis/Trick.png' },
  { shortcode: ':Panic:', url: '/emojis/Panic.png' },
  { shortcode: ':Lol:', url: '/emojis/Lol.png' },
  { shortcode: ':Please:', url: '/emojis/Please.png' },
  { shortcode: ':Yay:', url: '/emojis/Yay.png' },
  { shortcode: ':Yeah:', url: '/emojis/Yeah.png' },
  { shortcode: ':Sweats:', url: '/emojis/Sweats.png' },
  { shortcode: ':RollEyes:', url: '/emojis/RollEyes.png' },
  { shortcode: ':Dazed:', url: '/emojis/Dazed.png' },
  { shortcode: ':DrinkWater:', url: '/emojis/DrinkWater.png' },
  { shortcode: ':OMG:', url: '/emojis/OMG.png' },
  { shortcode: ':Drool:', url: '/emojis/Drool.png' },
  { shortcode: ':Saucy:', url: '/emojis/Saucy.png' },
  { shortcode: ':Blush:', url: '/emojis/Blush.png' },
  { shortcode: ':DayDream:', url: '/emojis/DayDream.png' },
  { shortcode: ':SpitBlood:', url: '/emojis/SpitBlood.png' },
  { shortcode: ':Yummy:', url: '/emojis/Yummy.png' },
  { shortcode: ':Sleep:', url: '/emojis/Sleep.png' },
  { shortcode: ':PassAway:', url: '/emojis/PassAway.png' },
  { shortcode: ':Love:', url: '/emojis/Love.png' },
  { shortcode: ':Dizzy:', url: '/emojis/Dizzy.png' },
  { shortcode: ':Moving:', url: '/emojis/Moving.png' },
  { shortcode: ':Pooh-pooh:', url: '/emojis/Pooh-pooh.png' },
  { shortcode: ':Cool:', url: '/emojis/Cool.png' },
  { shortcode: ':Cheers:', url: '/emojis/Cheers.png' },
  { shortcode: ':What:', url: '/emojis/What.png' },
];