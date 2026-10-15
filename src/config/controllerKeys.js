// Botões de controle para o meio do texto (como os guias do TrueAchievements/PSNProfiles).
// O guia guarda o botão GENÉRICO (posição no controle: face-down = ✕ no PlayStation = A no Xbox) e cada pessoa
// vê no estilo que escolher (PlayStation ou Xbox — useButtonStyle). O desenho de cada um fica em
// styles/components/_controller-keys.scss (mesmos ids). Só formas e letras genéricas: nada de logotipos.
export const BUTTON_STYLES = [
  { id: 'ps', label: 'PlayStation' },
  { id: 'xbox', label: 'Xbox' },
];

// group: organiza a lista de escolha · ps/xbox: nome do botão em cada controle (texto guardado e dica)
export const CONTROLLER_KEYS = [
  { id: 'face-down', group: 'Botões', ps: 'Cruz', xbox: 'A' },
  { id: 'face-right', group: 'Botões', ps: 'Círculo', xbox: 'B' },
  { id: 'face-left', group: 'Botões', ps: 'Quadrado', xbox: 'X' },
  { id: 'face-up', group: 'Botões', ps: 'Triângulo', xbox: 'Y' },
  { id: 'l1', group: 'Gatilhos', ps: 'L1', xbox: 'LB' },
  { id: 'r1', group: 'Gatilhos', ps: 'R1', xbox: 'RB' },
  { id: 'l2', group: 'Gatilhos', ps: 'L2', xbox: 'LT' },
  { id: 'r2', group: 'Gatilhos', ps: 'R2', xbox: 'RT' },
  { id: 'lstick', group: 'Analógicos', ps: 'Analógico esquerdo', xbox: 'Analógico esquerdo' },
  { id: 'rstick', group: 'Analógicos', ps: 'Analógico direito', xbox: 'Analógico direito' },
  { id: 'l3', group: 'Analógicos', ps: 'L3', xbox: 'LS' },
  { id: 'r3', group: 'Analógicos', ps: 'R3', xbox: 'RS' },
  { id: 'dpad', group: 'Direcional', ps: 'Direcional', xbox: 'Direcional' },
  { id: 'dpad-up', group: 'Direcional', ps: 'Cima', xbox: 'Cima' },
  { id: 'dpad-down', group: 'Direcional', ps: 'Baixo', xbox: 'Baixo' },
  { id: 'dpad-left', group: 'Direcional', ps: 'Esquerda', xbox: 'Esquerda' },
  { id: 'dpad-right', group: 'Direcional', ps: 'Direita', xbox: 'Direita' },
  { id: 'options', group: 'Sistema', ps: 'Options', xbox: 'Menu' },
  { id: 'share', group: 'Sistema', ps: 'Create', xbox: 'View' },
  { id: 'touchpad', group: 'Sistema', ps: 'Touchpad', xbox: 'View' },
  { id: 'home', group: 'Sistema', ps: 'Botão PS', xbox: 'Botão Xbox' },
];

export const CONTROLLER_KEY_IDS = new Set(CONTROLLER_KEYS.map((k) => k.id));
export const CONTROLLER_KEY_MAP = Object.fromEntries(CONTROLLER_KEYS.map((k) => [k.id, k]));
