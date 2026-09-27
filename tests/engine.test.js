import { Enigma, plugboardWays, rotorOrders, A } from '../src/enigma.js'
const ok = (name, got, want) => { console.log(got === want ? 'OK  ' : 'FAIL', name, got, want === got ? '' : 'want ' + want); if (got !== want) process.exitCode = 1 }
let e = new Enigma(); ok('AAAAA', e.encode('AAAAA'), 'BDZGO')
e = new Enigma({ positions: [0, 3, 20] }); const s = []; for (let i = 0; i < 4; i++) { e.press('A'); s.push(e.pos.map(p => A[p]).join('')) }
ok('double step', s.join(' '), 'ADV AEW BFX BFY')
const film = () => new Enigma({ positions: [0, 1, 19], plugs: 'HX AV BS CG DL FU IN KM OW RZ' })
e = film(); ok('HELLO film', e.encode('HELLO'), 'JIWOQ')
e = film(); ok('H path', e.press('H').contacts.map(c => A[c]).join(''), 'HXCJZTLNJJJ')
e = film(); ok('decrypt', e.encode('JIWOQ'), 'HELLO')
// Operation Barbarossa 1941 message (rotors II IV V, rings BUL, key BLA, plugs AV BS CG DL FU HZ IN KM OW RX)
e = new Enigma({ rotors: ['II', 'IV', 'V'], reflector: 'B', rings: [1, 20, 11], positions: [1, 11, 0], plugs: 'AV BS CG DL FU HZ IN KM OW RX' })
ok('Barbarossa', e.encode('EDPUDNRGYSZRCXNUYTPOMRMBOFKTBZREZKMLXLVEFGUEYSIOZVEQMIKUBPMMYLKLTTDEISMDICAGYKUACTCDOMOHWXMUUIAUBSTSLRNBZSZWNRFXWFYSSXJZVIJHIDISHPRKLKAYUPADTXQSPINQMATLPIFSVKDASCTACDPBOPVHJK'), 'AUFKLXABTEILUNGXVONXKURTINOWAXKURTINOWAXNORDWESTLXSEBEZXSEBEZXUAFFLIEGERSTRASZERIQTUNGXDUBROWKIXDUBROWKIXOPOTSCHKAXOPOTSCHKAXUMXEINSAQTDREINULLXUHRANGETRETENXANGRIFFXINFXRGTX')
ok('plug10', plugboardWays(10).toString(), '150738274937250')
ok('orders', rotorOrders(5).toString(), '60')
let self = 0; e = new Enigma({ plugs: 'AB CD EF' }); for (let i = 0; i < 20000; i++) { const k = i % 26; if (e.press(A[k]).out === k) self++ }
ok('never itself', self, 0)
