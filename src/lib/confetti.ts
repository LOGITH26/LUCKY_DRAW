import confetti from 'canvas-confetti';
import type { ConfettiStyle } from '@/components/SettingsModal';

export function celebrateConfetti(style: ConfettiStyle = 'petals') {
  switch (style) {
    case 'petals':
      confettiPetals();
      break;
    case 'glitter':
      confettiGlitter();
      break;
    case 'ribbons':
      confettiRibbons();
      break;
    case 'balloons':
      confettiBalloons();
      break;
  }
}

function confettiPetals() {
  const colors = ['#FFB81C', '#FF6F00', '#FFF8E7', '#FFD700'];

  confetti({
    particleCount: 100,
    spread: 100,
    origin: { y: 0.6 },
    colors,
    startVelocity: 40,
    gravity: 0.6,
    ticks: 300,
    scalar: 0.9,
    shapes: ['circle'],
  });

  setTimeout(() => {
    confetti({
      particleCount: 60,
      angle: 60,
      spread: 70,
      origin: { x: 0, y: 0.65 },
      colors,
      startVelocity: 50,
      shapes: ['circle'],
      scalar: 0.8,
    });
    confetti({
      particleCount: 60,
      angle: 120,
      spread: 70,
      origin: { x: 1, y: 0.65 },
      colors,
      startVelocity: 50,
      shapes: ['circle'],
      scalar: 0.8,
    });
  }, 200);

  setTimeout(() => {
    confetti({
      particleCount: 50,
      spread: 120,
      origin: { y: 0 },
      colors,
      startVelocity: 25,
      gravity: 0.3,
      ticks: 400,
      shapes: ['circle'],
      scalar: 0.7,
    });
  }, 500);
}

function confettiGlitter() {
  const colors = ['#FFD700', '#FFA500', '#FFEC8B', '#DAA520', '#FFFF00'];

  confetti({
    particleCount: 200,
    spread: 160,
    origin: { y: 0.5 },
    colors,
    startVelocity: 50,
    gravity: 0.9,
    ticks: 200,
    scalar: 0.5,
    shapes: ['star'],
  });

  setTimeout(() => {
    confetti({
      particleCount: 150,
      spread: 120,
      origin: { y: 0.3 },
      colors,
      startVelocity: 35,
      gravity: 0.8,
      ticks: 250,
      scalar: 0.4,
      shapes: ['star'],
    });
  }, 300);

  setTimeout(() => {
    confetti({
      particleCount: 100,
      spread: 200,
      origin: { y: 0.6 },
      colors,
      startVelocity: 30,
      gravity: 1,
      ticks: 180,
      scalar: 0.3,
      shapes: ['star'],
    });
  }, 700);
}

function confettiRibbons() {
  const colors = ['#FFB81C', '#FF6F00', '#FFF8E7', '#FFD700', '#FF8C00', '#B71C1C', '#1B5E20'];

  confetti({
    particleCount: 120,
    spread: 100,
    origin: { y: 0.6 },
    colors,
    startVelocity: 45,
    gravity: 0.8,
    ticks: 250,
    scalar: 1.1,
  });

  setTimeout(() => {
    confetti({
      particleCount: 80,
      angle: 60,
      spread: 70,
      origin: { x: 0, y: 0.65 },
      colors,
      startVelocity: 55,
    });
    confetti({
      particleCount: 80,
      angle: 120,
      spread: 70,
      origin: { x: 1, y: 0.65 },
      colors,
      startVelocity: 55,
    });
  }, 200);

  setTimeout(() => {
    confetti({
      particleCount: 60,
      spread: 120,
      origin: { y: 0 },
      colors,
      startVelocity: 30,
      gravity: 0.5,
      ticks: 300,
      shapes: ['circle'],
      scalar: 0.8,
    });
  }, 500);

  setTimeout(() => {
    confetti({
      particleCount: 50,
      spread: 80,
      origin: { y: 0.5 },
      colors,
      startVelocity: 25,
      gravity: 1,
      ticks: 200,
    });
  }, 900);
}

function confettiBalloons() {
  const colors = ['#FFB81C', '#FF6F00', '#FFF8E7', '#FFD700', '#1B5E20', '#B71C1C', '#00ACC1'];

  // Balloons rising from bottom
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 1 },
        colors,
        startVelocity: -30,
        gravity: -0.2,
        ticks: 400,
        scalar: 1.5,
        shapes: ['circle'],
        flatParticle: true,
      });
    }, i * 150);
  }

  // Some falling confetti mixed in
  setTimeout(() => {
    confetti({
      particleCount: 80,
      spread: 120,
      origin: { y: 0 },
      colors,
      startVelocity: 20,
      gravity: 0.4,
      ticks: 300,
      scalar: 0.8,
    });
  }, 200);
}
