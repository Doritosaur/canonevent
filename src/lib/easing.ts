import { Easing } from 'react-native';

// React Native types `Easing.quad` as an unbound method; wrapping it keeps lint (and `this`) happy.
const quad = (t: number) => Easing.quad(t);

export const outQuad = Easing.out(quad);
export const inOutQuad = Easing.inOut(quad);
