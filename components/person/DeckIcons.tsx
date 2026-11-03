const b = { width: 56, height: 56, viewBox: '0 0 64 64', fill: 'none', stroke: '#0E0E12', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, className: 'di', style: { overflow: 'visible' } } as const;
export const DiStar = () => <svg {...b}><path className="di-star" d="M32 6l7 15 16 2-12 11 3 16-14-8-14 8 3-16L9 23l16-2z" /></svg>;
export const DiBook = () => <svg {...b}><path d="M12 14h16a4 4 0 0 1 4 4v36a4 4 0 0 0-4-4H12z" /><path className="di-pg" d="M52 14H36a4 4 0 0 0-4 4v36a4 4 0 0 1 4-4h16z" /></svg>;
export const DiRocket = () => <svg {...b}><g className="di-rk"><path d="M32 6c10 8 14 20 10 34H22C18 26 22 14 32 6z" /><circle cx="32" cy="24" r="5" /><path d="M22 40l-8 10h12M42 40l8 10H38" /><path className="di-fl" d="M28 44c0 6 2 10 4 12 2-2 4-6 4-12" /></g></svg>;
export const DiPeople = () => <svg {...b}><g className="di-ev"><circle cx="20" cy="22" r="7" /><circle cx="44" cy="22" r="7" /><path d="M6 50c1-9 7-14 14-14s13 5 14 14M30 50c1-9 7-14 14-14s13 5 14 14" /></g></svg>;
export const DiFlag = () => <svg {...b}><path d="M8 54c10 0 10-14 20-14s8-14 18-14" /><path d="M46 26V8l10 5-10 5" /></svg>;
export const DiHeart = () => <svg {...b}><path d="M32 54S10 40 10 24a11 11 0 0 1 22-3 11 11 0 0 1 22 3c0 16-22 30-22 30z" /><path d="M18 30h8l3-6 5 12 3-6h9" /></svg>;
