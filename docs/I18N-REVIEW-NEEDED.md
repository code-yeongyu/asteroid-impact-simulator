# I18N Review Needed

T30 propagated the English canonical locale resources to all configured non-English locales using machine translation with scientific-term review.

## Machine-translated locales pending native-speaker review

- Arabic (`ar`) — RTL review required
- Bengali (`bn`)
- Czech (`cs`)
- German (`de`)
- Greek (`el`)
- Spanish (`es`)
- Persian (`fa`) — RTL review required
- Filipino (`fil`)
- French (`fr`)
- Hebrew (`he`) — RTL review required
- Hindi (`hi`)
- Indonesian (`id`)
- Italian (`it`)
- Japanese (`ja`)
- Korean (`ko`)
- Dutch (`nl`)
- Polish (`pl`)
- Portuguese, Brazil (`pt-BR`)
- Portuguese, Portugal (`pt-PT`)
- Russian (`ru`)
- Swedish (`sv`)
- Thai (`th`)
- Turkish (`tr`)
- Ukrainian (`uk`)
- Vietnamese (`vi`)
- Chinese, Simplified (`zh-CN`)
- Chinese, Traditional (`zh-TW`)

## Methodology

- Preserved every placeholder and ICU MessageFormat token exactly.
- Preserved scientific units and symbols literally: `kg`, `m`, `km`, `km/s`, `J`, `Mt`, `°`, `kg/m³`, `cal/cm²`, `psi`.
- Used scientific terminology for impact physics concepts such as kinetic energy, atmospheric entry, air blast overpressure, crater diameter, thermal flux, and seismic moment magnitude.
- For RTL locales, avoided explicit LTR/RTL control characters and kept unit tokens unchanged for bidi isolation by the UI layer.

## V2 follow-up

Native-speaker review should validate nuance, domain terminology, and plural readability before these machine translations are treated as final editorial copy.
