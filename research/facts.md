# Enigma I: verified facts with sources

Compiled 2026-09-27. Each bullet is followed by its source. [UNCERTAIN] marks figures that vary between sources or are estimates.

Short source keys used below:
- WP-EM = https://en.wikipedia.org/wiki/Enigma_machine
- WP-RD = https://en.wikipedia.org/wiki/Enigma_rotor_details
- WP-CA = https://en.wikipedia.org/wiki/Cryptanalysis_of_the_Enigma
- WP-BOMBE = https://en.wikipedia.org/wiki/Bombe
- WP-BOMBA = https://en.wikipedia.org/wiki/Bomba_(cryptography)
- WP-ZS = https://en.wikipedia.org/wiki/Zygalski_sheets
- WP-ULTRA = https://en.wikipedia.org/wiki/Ultra_(cryptography)
- WP-SCH = https://en.wikipedia.org/wiki/Arthur_Scherbius
- WP-MR = https://en.wikipedia.org/wiki/Marian_Rejewski
- CM-I = https://www.cryptomuseum.com/crypto/enigma/i/index.htm
- CM-SB = https://www.cryptomuseum.com/crypto/enigma/i/sb.htm
- CM-WIRE = https://www.cryptomuseum.com/crypto/enigma/wiring.htm
- CM-BOMBE = https://www.cryptomuseum.com/crypto/bombe/index.htm
- RU = https://ru.wikipedia.org/wiki/Энигма (Russian overview, for wording)

## 1. Invention and adoption

- Arthur Scherbius (30 Oct 1878 - 13 May 1929), German electrical engineer, filed a patent for a rotor cipher machine on 23 February 1918. - WP-SCH, WP-EM
- In 1918 he co-founded Scherbius & Ritter; patent rights passed to Gewerkschaft Securitas, which founded Chiffriermaschinen AG on 9 July 1923. - WP-EM
- The machine was marketed commercially under the brand name Enigma from 1923. - WP-EM
- Scherbius died in 1929 in a horse-carriage accident, before the military success of his machine. - WP-SCH
- German Navy adopted a modified Enigma in 1926 (Funkschluessel C); the Army (Reichswehr) introduced its own version (Enigma G) by 15 July 1928. - WP-EM
- Enigma I (plugboard model for Army and Air Force) was developed 1927/29 by Chiffriermaschinen AG and introduced in 1930 ("Enigma G was modified to Enigma I by June 1930"). - CM-I, WP-EM
- The plugboard (Steckerbrett) was the key difference from commercial models and was only available to the German armed forces. - WP-EM, CM-SB
- Production: cryptomuseum's serial-number tables give 20,306 Enigma I built by ChiMaAG / Heimsoeth und Rinke (K&K) 1927-1945 plus 3,360 by Ertel (1942-45), i.e. roughly 23,700 Enigma I; cryptomuseum summarises "more than 20,000". [UNCERTAIN: total for all Enigma models is often quoted as ~40,000, no firm primary figure found] - CM-I

## 2. Electrical path (Enigma I)

- Power: a standard 4.5 V Wehrmacht battery in a compartment at the rear right. - CM-I
- Path: battery -> key switch -> plugboard -> entry wheel (ETW) -> rotors right-to-left -> reflector -> rotors left-to-right -> ETW -> plugboard -> key switch of the released keys -> lamp. - WP-EM, CM-I
- Enigma I entry wheel is wired in plain alphabetical order ABCDEF... (the commercial Enigma used keyboard order QWERTZ...). - WP-RD, CM-WIRE
- Each Enigma I shipped with 12 plug cables: 10 for use plus 2 spares; up to 13 were physically possible, but procedure generally prescribed 10. - CM-I
- Early wartime traffic used fewer plugs (6 leads in late 1938; later 10). - WP-CA
- Rotor I-V, reflector A/B/C and ETW wiring: see wiring.json (both sources agree letter for letter). Turnover (window) letters: I=Q, II=E, III=V, IV=J, V=Z. - WP-RD, CM-WIRE
- Rotors I-III from 1930; IV and V added on 15 December 1938, raising rotor orders from 6 to 60. - WP-RD, CM-I
- Reflector B (UKW-B) was the standard wartime reflector; UKW-A was used before WWII; UKW-C only late in the war. - CM-WIRE
- The output letter is shown by one of 26 lamps (lamp board), so the operator needed an assistant to write down the lit letters. - WP-EM

## 3. Stepping

- Each key press first advances the rightmost rotor via a ratchet and three pawls, then the circuit closes. - WP-EM, WP-RD
- A notch on the alphabet ring lets the pawl also push the next rotor to the left; e.g. rotor I steps the middle rotor when it moves Q->R. - WP-RD
- Double stepping: when the middle rotor reaches its own notch, on the next key press it steps again together with the left rotor. Example with rotors I-II-III: ADU -> ADV -> AEW -> BFX. - WP-RD
- Because of double stepping, the period of a 3-rotor Enigma with single notches is 26 x 25 x 26 = 16,900, not 26^3 = 17,576. - WP-EM

## 4. Ring setting (Ringstellung)

- The alphabet ring (with the notch attached) can be rotated relative to the rotor wiring; its position is the Ringstellung. - WP-RD, WP-EM
- Changing the ring shifts the wiring relative to the displayed letter and relative to the turnover point, so it changes both the substitution and when the next rotor steps. - WP-RD
- The left ring only matters for display (the reflector does not move, so nothing is stepped by the left notch); only the middle and right rings affect stepping, giving 26^2 = 676 effective ring combinations. [Reasoning, not quoted verbatim in sources; widely stated in keyspace analyses]

## 5. Keyspace (Army / Air Force Enigma I, 3 rotors from 5, reflector B)

- Rotor orders: 5 x 4 x 3 = 60. - CM-I
- Start positions: 26^3 = 17,576. - WP-CA
- Plugboard with 10 pairs: 26! / (6! x 10! x 2^10) = 150,738,274,937,250 (about 1.5 x 10^14). - WP-EM (computed and checked locally)
- Most common total (Wikipedia): 60 x 17,576 x 150,738,274,937,250 = 158,962,555,217,826,360,000 (about 1.59 x 10^20, ~67 bits). This omits ring settings. - WP-EM
- If ring settings are counted as 676 effective: 1.59 x 10^20 x 676 = about 1.07 x 10^23. Some authors count all 26^3 ring settings; ring settings largely overlap with start positions, so counts differ by author. [UNCERTAIN: depends on convention]
- The plugboard alone contributes more than an extra rotor would (about 150 trillion settings). - WP-EM

## 6. Key properties

- The reflector makes Enigma self-reciprocal: with identical settings, typing ciphertext gives plaintext, so the same machine encrypts and decrypts without a mode switch. - WP-EM
- Because current must go out through a different contact than it came in, no letter can ever encrypt to itself. This let codebreakers rule out crib positions where any letter matched. - WP-CA
- Test vector: rotors I-II-III, UKW-B, rings AAA, start AAA, no plugs: AAAAA -> BDZGO (verified with local simulator, see wiring.json). - WP-RD

## 7. Operating procedure

- Daily key sheet (Schluesseltafel) columns: date, Walzenlage (rotor order), Ringstellung (ring settings), Steckerverbindungen (plug pairs), and Kenngruppen (identifying groups); pre-1938 sheets also listed a common Grundstellung. - WP-EM, WP-CA
- Up to 15 Sept 1938: all operators on a net used the same Grundstellung from the sheet; the operator chose a 3-letter message key, typed it twice (6 letters), then set the rotors to the message key and enciphered the text. - WP-CA
- From 15 Sept 1938: the operator chose his own Grundstellung per message, sent it in clear, followed by the doubly enciphered message key. - WP-CA, WP-BOMBA
- From 1 May 1940 (Army/Air Force, just before the 10 May offensive) the doubling of the message key was dropped. - WP-CA
- Messages were limited to 250 letters; longer texts were split. - WP-EM
- Stereotyped phrases such as "WETTER" (weather), "KEINE BESONDEREN EREIGNISSE" (nothing to report), and "FORT" (continuation) gave cribs. - WP-CA

## 8. Breaking

- Rejewski, Zygalski and Rozycki joined the Polish Cipher Bureau on 1 Sept 1932; Rejewski reconstructed the military Enigma wiring in late 1932 using permutation group theory plus documents from spy Hans-Thilo Schmidt supplied by French intelligence (Bertrand). - WP-CA, WP-MR
- Rejewski's "characteristics" method exploited the doubled message key (letters 1-4, 2-5, 3-6 linked); a cyclometer (1934 or 1935) helped build a catalogue of characteristics. Poles read Enigma traffic from January 1933. - WP-CA, WP-EM
- Zygalski sheets (perforated sheets, about Oct 1938) used "females" (repeated letters in the doubled indicator); 26 sheets per rotor order. - WP-ZS
- Bomba kryptologiczna designed by Rejewski about Oct 1938; six built in Warsaw, ready mid-November 1938, each an aggregate of six Enigmas; daily keys recovered in about two hours. - WP-BOMBA
- Rotors IV and V (15 Dec 1938) multiplied the work by ten (60 orders instead of 6), beyond Polish resources. - WP-ZS, WP-BOMBA
- 26-27 July 1939, Pyry near Warsaw: the Poles gave French and British intelligence their methods, Zygalski sheets, bomba details and promised a reconstructed Enigma to each. - WP-EM, WP-CA
- Turing and Welchman reported to Bletchley Park on 4 Sept 1939. - WP-CA
- Turing's bombe was crib-based (more general than the Polish bomba). First bombe "Victory" installed 18 March 1940; "Agnus Dei" with Welchman's diagonal board installed 8 August 1940. - WP-BOMBE, WP-CA
- British bombe count: 5 in June 1941, 15 by end 1941, 30 by Sept 1942, 49 by Jan 1943, "eventually 210 at the end of the war"; cryptomuseum says "over 200". [UNCERTAIN: 210 vs 211 differ by source] - WP-CA, CM-BOMBE
- About 2,000 Wrens operated bombes by 1945. - WP-CA
- A working bombe rebuild (John Harper's team) was completed in 2007 and is now at The National Museum of Computing, Bletchley Park (moved 2018). - CM-BOMBE, WP-BOMBE
- Intelligence from Enigma and other high-grade ciphers was code-named Ultra. - WP-ULTRA
- Naval Enigma M4 (4 rotors) came into use for Atlantic U-boats ("Shark") on 1 Feb 1942, causing a long blackout until captured material and fast US Navy 4-rotor bombes restored reading. - WP-CA

## 9. Effect on the war (debated)

- Harry Hinsley, official historian of British Intelligence in WWII, said the war would have been "something like two years longer, perhaps three years longer, possibly four years longer" without Ultra. - WP-ULTRA
- Eisenhower called Ultra "decisive" in a letter to Menzies after the war. - WP-ULTRA
- Counter-views: John Keegan and others argue the shortening may have been as little as a few months; Ultra played little role on the Eastern Front. Present the "two years" figure as an estimate, not a fact. - WP-ULTRA
