# UCSE5 5-bit encoding

UCSE5 is a special 5-bit encoding designed for using in edge cases where only a subset of ASCII (lowercase latin + some special chars) is allowed. It helps to reduce the amount of data transferred over the network. Any non-closed byte must be filled with zeros. There must be a NULL terminator at the end of the string. It may repeat twice because of filling non-closed bytes with zeros.

Character map:
- `0` — NULL terminator
- `1` — a
- `2` — b
- `3` — c
- `4` — d
- `5` — e
- `6` — f
- `7` — g
- `8` — h
- `9` — i
- `10` — j
- `11` — k
- `12` — l
- `13` — m
- `14` — n
- `15` — o
- `16` — p
- `17` — q
- `18` — r
- `19` — s
- `20` — t
- `21` — u
- `22` — v
- `23` — w
- `24` — x
- `25` — y
- `26` — z
- `27` — .
- `28` — /
- `29` — -
- `30` — _
- `31` — !

Encoding example:
- Phrase `i_love_cupcakes!` (16 chars, 11 bytes long in UCSE5 including NULL terminator).  
Binary representation:<pre>
0100111110011000111110110001011111000011101011000000011000010101100101100111111100000000
</pre>
Hex representation:<pre>
4f98fb17c3ac0615967f00
</pre>
