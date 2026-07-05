import unittest

from llm_service import LocalLLMService


class LocalLLMServiceTests(unittest.TestCase):
    def setUp(self):
        self.service = LocalLLMService()

    def test_sanitize_code_content_extracts_markdown_code_block(self):
        state = {
            "inside_think": False,
            "inside_code": False,
            "has_code_block": False,
            "finished": False,
            "buffer": "",
        }

        chunks = self.service._sanitize_code_content(
            "```python\nprint('hi')\n```",
            state,
            ["```"],
        )

        self.assertEqual(chunks, ["print('hi')\n"])
        self.assertTrue(state["finished"])

    def test_fallback_chunks_split_large_text(self):
        chunks = self.service._fallback_chunks("a" * 250, chunk_size=100)

        self.assertEqual(len(chunks), 3)
        self.assertEqual(len(chunks[0]), 100)
        self.assertEqual(len(chunks[1]), 100)
        self.assertEqual(len(chunks[2]), 50)


if __name__ == "__main__":
    unittest.main()
