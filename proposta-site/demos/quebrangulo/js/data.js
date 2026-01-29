/**
 * data.js - Dados da aplicação
 * Contém dados iniciais de pagamentos e verbas
 */

const SECRETARIAS = [
    "Educação",
    "Administração e Finanças",
    "Saúde",
    "Infraestrutura e Obras",
    "Assistência Social",
    "Turismo, Cultura e Esporte",
    "Agricultura"
];

let pagamentos = [
    { data: "2026-01-05", periodo: "2026-01", secretaria: "Educação", fornecedor: "Alfa Serviços", documento: "NF 1021", valor: 185000 },
    { data: "2026-01-07", periodo: "2026-01", secretaria: "Saúde", fornecedor: "MedSupply LTDA", documento: "Emp 881", valor: 241300 },
    { data: "2026-01-10", periodo: "2026-01", secretaria: "Infraestrutura e Obras", fornecedor: "Construtora Delta", documento: "NF 778", valor: 520000 },
    { data: "2026-01-11", periodo: "2026-01", secretaria: "Administração e Finanças", fornecedor: "TechGov", documento: "NF 550", valor: 98000 },
    { data: "2026-01-13", periodo: "2026-01", secretaria: "Educação", fornecedor: "Papelaria Nordeste", documento: "NF 903", valor: 42000 },
    { data: "2026-01-15", periodo: "2026-01", secretaria: "Assistência Social", fornecedor: "Cesta Viva", documento: "NF 221", valor: 135000 },
    { data: "2026-01-18", periodo: "2026-01", secretaria: "Turismo, Cultura e Esporte", fornecedor: "Som & Luz Produções", documento: "NF 991", valor: 76000 },
    { data: "2026-01-20", periodo: "2026-01", secretaria: "Agricultura", fornecedor: "AgroTec", documento: "NF 112", valor: 59000 },
    { data: "2026-01-22", periodo: "2026-01", secretaria: "Saúde", fornecedor: "MedSupply LTDA", documento: "NF 1044", valor: 198000 },
    { data: "2026-01-25", periodo: "2026-01", secretaria: "Infraestrutura e Obras", fornecedor: "Pavimenta Brasil", documento: "NF 120", valor: 310000 },
    { data: "2025-12-08", periodo: "2025-12", secretaria: "Educação", fornecedor: "Alfa Serviços", documento: "NF 998", valor: 120000 },
    { data: "2025-12-18", periodo: "2025-12", secretaria: "Saúde", fornecedor: "LabVida", documento: "NF 771", valor: 87000 },
];

let verbas = [
    { periodo: "2026-01", secretaria: "Educação", verba_recebida: 1270000, verba_destinada: 450000, verba_aplicada: 1100000 },
    { periodo: "2026-01", secretaria: "Saúde", verba_recebida: 635000, verba_destinada: 280000, verba_aplicada: 565000 },
    { periodo: "2026-01", secretaria: "Infraestrutura e Obras", verba_recebida: 1443000, verba_destinada: 930000, verba_aplicada: 855000 },
    { periodo: "2026-01", secretaria: "Administração e Finanças", verba_recebida: 464000, verba_destinada: 0, verba_aplicada: 227000 },
    { periodo: "2026-01", secretaria: "Assistência Social", verba_recebida: 670000, verba_destinada: 310000, verba_aplicada: 515000 },
    { periodo: "2026-01", secretaria: "Turismo, Cultura e Esporte", verba_recebida: 309000, verba_destinada: 124000, verba_aplicada: 186000 },
    { periodo: "2026-01", secretaria: "Agricultura", verba_recebida: 289000, verba_destinada: 52000, verba_aplicada: 165000 },
    { periodo: "2025-12", secretaria: "Educação", verba_recebida: 1100000, verba_destinada: 330000, verba_aplicada: 838000 },
    { periodo: "2025-12", secretaria: "Saúde", verba_recebida: 550000, verba_destinada: 240000, verba_aplicada: 416000 },
];
