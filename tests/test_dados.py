import csv
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATEGORIAS = {'acesso', 'cadastro', 'fiscal', 'financeiro', 'estoque', 'vendas', 'infraestrutura', 'outros'}
PRIORIDADES = {'critica', 'alta', 'media', 'baixa'}

class DadosTest(unittest.TestCase):
    def test_conjunto_rotulado(self):
        caminho = ROOT / 'dados/chamados_rotulados.csv'
        self.assertTrue(caminho.exists(), 'Conjunto rotulado ausente')
        with caminho.open(encoding='utf-8', newline='') as arquivo:
            leitor = csv.DictReader(arquivo)
            self.assertEqual(leitor.fieldnames, ['id', 'chamado', 'categoria', 'prioridade', 'filial', 'sistema'])
            linhas = list(leitor)
        self.assertEqual(len(linhas), 40)
        self.assertEqual(len({linha['id'] for linha in linhas}), 40)
        self.assertEqual(len({linha['chamado'] for linha in linhas}), 40)
        self.assertEqual({linha['categoria'] for linha in linhas}, CATEGORIAS)
        self.assertEqual({linha['prioridade'] for linha in linhas}, PRIORIDADES)
        for linha in linhas:
            with self.subTest(id=linha['id']):
                self.assertTrue(all(linha.values()))
                self.assertIn(linha['categoria'], CATEGORIAS)
                self.assertIn(linha['prioridade'], PRIORIDADES)

if __name__ == '__main__':
    unittest.main()
