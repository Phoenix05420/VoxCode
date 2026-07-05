import unittest
from unittest.mock import patch

from command_processor import CommandProcessor


class CommandProcessorTests(unittest.TestCase):
    def build_processor(self):
        with patch("command_processor.NLPService", side_effect=Exception("skip heavy NLP")):
            return CommandProcessor()

    def test_java_crud_template_does_not_crash(self):
        processor = self.build_processor()

        result = processor.process_transcript("Create a CRUD API in Java")

        self.assertEqual(result["language"], "java")
        self.assertEqual(result["template_type"], "spring_crud")

    def test_sql_language_is_detected(self):
        processor = self.build_processor()

        result = processor.process_transcript("Create a SQL query to list active users")

        self.assertEqual(result["language"], "sql")


if __name__ == "__main__":
    unittest.main()
