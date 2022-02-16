import { publish } from 'gh-pages';

publish(
 'build', // path to public directory
 {
  branch: 'gh-pages',
  repo: 'https://github.com/sarahwxie/delordle.git', // Update to point to your repository
  user: {
   name: 'Sarah W Xie', // update to use your name
   email: 'sarahwxie@gmail.com' // Update to use your email
  },
  dotfiles: true
  },
  () => {
   console.log('Deploy Complete!');
  }
);