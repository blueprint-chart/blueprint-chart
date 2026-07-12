// Color palettes curated from pypalettes (https://github.com/y-sunflower/pypalettes)

export interface PaletteEntry {
  name: string
  label: string
  colors: readonly string[]
}

const PALETTES: PaletteEntry[] = [
  { name: 'Blueprint', label: 'Blueprint', colors: ['#2563A0', '#D4A63A', '#C94044', '#2D8659', '#4B90CF', '#163A65'] },
  { name: 'BlueprintBold', label: 'Blueprint Bold', colors: ['#2563A0', '#DDF247', '#C94044', '#2D8659', '#D4A63A', '#163A65'] },
  { name: 'JosefAlbers', label: 'Albers', colors: ['#c00559', '#de1f6c', '#f3a20d', '#f07a13', '#de6716'] },
  { name: 'Durorthod', label: 'Amber', colors: ['#2c0c00', '#803c15', '#c6782c', '#ffa91d', '#fff3ad'] },
  { name: 'X41', label: 'Berry', colors: ['#411f6b', '#623976', '#be3979', '#db928a', '#e2c6a6'] },
  { name: 'Bright', label: 'Bright', colors: ['#462255', '#ff8811', '#9dd9d2', '#046e8f', '#d44d5c'] },
  { name: 'Cancri', label: 'Cancri', colors: ['#343854', '#8c384d', '#cf2438', '#d95e31', '#f0c742', '#f8f0e5'] },
  { name: 'Ceres', label: 'Ceres', colors: ['#181d20', '#4a5f71', '#6f8ba0', '#f8f9fa'] },
  { name: 'MarcChagall', label: 'Chagall', colors: ['#3f6f76', '#69b7ce', '#c65840', '#f4ce4b', '#62496f'] },
  { name: 'Pelewensis', label: 'Coral', colors: ['#e2b000', '#f7f656', '#2449a2', '#809098', '#0d1115'] },
  { name: 'Deathmasks', label: 'Deathmasks', colors: ['#926159', '#87876e', '#c7d2d8', '#62b7c8', '#43535c', '#23313c'] },
  { name: 'Leucosternon', label: 'Deep Sea', colors: ['#071140', '#0e34b2', '#207cf5', '#9ec8ff', '#fbfb53'] },
  { name: 'Deelite', label: 'Deelite', colors: ['#48448e', '#8ccc58', '#fc4d97', '#b82578'] },
  { name: 'X10', label: 'Dusk', colors: ['#2a2432', '#4f3855', '#846d86', '#efefcf', '#d5b77d', '#a89e5e'] },
  { name: 'Vitrixerand', label: 'Earth', colors: ['#281b27', '#723f27', '#9b6044', '#b5804c', '#facd9a'] },
  { name: 'Egypt', label: 'Egypt', colors: ['#dd5129', '#0f7ba2', '#43b284', '#fab255'] },
  { name: 'ElectronicNight', label: 'Electric Night', colors: ['#cb54d6', '#3e45c4', '#21191a', '#362f78', '#57b4ae'] },
  { name: 'LutjanusSebae', label: 'Emperor', colors: ['#e5e9ea', '#a2bac5', '#ce3d21', '#992216', '#490d07'] },
  { name: 'Enara', label: 'Enara', colors: ['#262626', '#3d5983', '#5a8a54', '#cfb023'] },
  { name: 'Camo871', label: 'Fiesta', colors: ['#ffff14', '#fea31d', '#ce2d41', '#3a3fa3'] },
  { name: 'Folklore', label: 'Folklore', colors: ['#272727', '#5c5c5c', '#bababa', '#f8f8f8'] },
  { name: 'Fritsch', label: 'Fritsch', colors: ['#0f8d7b', '#8942bd', '#1e1a1a', '#eadd17'] },
  { name: 'AgSunset', label: 'Glow', colors: ['#4b2991', '#872ca2', '#c0369d', '#ea4f88', '#fa7876', '#f6a97a', '#edd9a3'] },
  { name: 'Harvey', label: 'Harvey', colors: ['#c6d4d6', '#274c4f', '#a4432d', '#b17c51'] },
  { name: 'Heep', label: 'Heep', colors: ['#466e9a', '#e84d45', '#21201c', '#a1baac'] },
  { name: 'Imperator', label: 'Imperator', colors: ['#04093a', '#0527b4', '#555dfe', '#faf830', '#b8980f'] },
  { name: 'Klimt', label: 'Klimt', colors: ['#df9ed4', '#c93f55', '#eacc62', '#469d76', '#3c4b99', '#924099'] },
  { name: 'KnickCity', label: 'Knick City', colors: ['#0c2340', '#ff6720', '#707372', '#c8c9c7'] },
  { name: 'London', label: 'London', colors: ['#bd241e', '#e56b1e', '#ffcd22', '#15274d'] },
  { name: 'Lover', label: 'Lover', colors: ['#b8396b', '#ffd1d7', '#fff5cc', '#76bae0', '#b28f81', '#54483e'] },
  { name: 'Maya', label: 'Maya', colors: ['#3d5a80', '#98c1d9', '#e0fbfc', '#ee6c4d', '#293241'] },
  { name: 'X24', label: 'Mocha', colors: ['#2b1917', '#7e5945', '#bc927b', '#f1e6e1'] },
  { name: 'Camo873', label: 'Neon', colors: ['#132f8a', '#5a56c8', '#fc7ead', '#ffca3e'] },
  { name: 'NetsCity', label: 'Nets City', colors: ['#010101', '#ffb81c', '#da291c', '#004c97', '#418fde'] },
  { name: 'Nodoubt', label: 'No Doubt', colors: ['#385581', '#6dbac6', '#dac190', '#c9052c'] },
  { name: 'ClaesOldenburg', label: 'Oldenburg', colors: ['#95b1c9', '#263656', '#698946', '#f8d440', '#c82720'] },
  { name: 'Peacesells', label: 'Peace Sells', colors: ['#9a5155', '#483943', '#ecc463', '#a497b2'] },
  { name: 'PabloPicasso', label: 'Picasso', colors: ['#4e7989', '#a9011b', '#e4a826', '#80944e', '#dcd6b2'] },
  { name: 'Bifasciatum', label: 'Reef', colors: ['#080214', '#16407b', '#2b7ff9', '#b1fcfc', '#6cbe50'] },
  { name: 'SiameseDream', label: 'Siamese Dream', colors: ['#f0e9e0', '#2f1f16', '#a34d2c', '#cd8e40'] },
  { name: 'X115', label: 'Sienna', colors: ['#001a29', '#633633', '#834a39', '#e3b571', '#eee6a6'] },
  { name: 'Sixers', label: 'Sixers', colors: ['#888b8d', '#e4d5d3', '#003da5', '#d50032'] },
  { name: 'SolLeWitt', label: 'Sol LeWitt', colors: ['#0a71b6', '#f9c40a', '#190506', '#eb5432', '#eaf2f0'] },
  { name: 'Sunset', label: 'Sunset', colors: ['#41476b', '#675478', '#9e6374', '#c67b6f', '#de9b71', '#efbc82', '#fbdfa2'] },
  { name: 'Sunset2', label: 'Sunset II', colors: ['#1d457f', '#61599d', '#c36377', '#eb7f54', '#f2af4a'] },
  { name: 'Sunset3', label: 'Sunset III', colors: ['#390e40', '#701c34', '#a63228', '#c7662a', '#eba42b'] },
  { name: 'Pal9', label: 'Tropical', colors: ['#273b5b', '#c1c243', '#e73e26', '#2e6657', '#e8f5b3', '#24a99c'] },
  { name: 'Salvelinus', label: 'Trout', colors: ['#e6452e', '#e49a36', '#f9dd4c', '#5b4a4c', '#01040e'] },
  { name: 'TheovanDoesburg', label: 'Van Doesburg', colors: ['#bd748f', '#3d578e', '#bfab68', '#dad7d0', '#272928'] },
  { name: 'Wizards', label: 'Wizards', colors: ['#c8102e', '#0c2340', '#8d9093', '#c8c9c7'] },
  { name: 'FrancescoXanto', label: 'Xanto', colors: ['#2c6aa5', '#d9ae2c', '#ddc655', '#d88c27', '#64894d'] },
  { name: 'Zeppelin', label: 'Zeppelin', colors: ['#efdb15', '#739c9c', '#0d484c', '#c71a08'] },
]

const PALETTE_MAP: Record<string, readonly string[]> = Object.fromEntries(
  PALETTES.map(p => [p.name, p.colors]),
)

export function resolvePalette(paletteName: string | undefined): string[] | undefined {
  if (!paletteName) {
    return undefined
  }
  const scheme = PALETTE_MAP[paletteName]
  return scheme ? [...scheme] : undefined
}

export function listPalettes(): PaletteEntry[] {
  return PALETTES
}
