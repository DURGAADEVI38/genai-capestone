from pathlib import Path
import os
class RAGSystem:
    def __init__(self): self.documents=[]
    def load_documents(self):
        root=Path(__file__).resolve().parents[2]/'samples'
        for path in list(root.glob('*.md'))+list(root.glob('*.txt')):
            category={'hr_policies':'hr','it_support':'it','training_materials':'training','security_guidelines':'security'}.get(path.stem,'general')
            self.documents.append({'source':path.name,'category':category,'content':path.read_text(encoding='utf-8')})
    def search(self,query,category=None,top_k=5):
        words={word.strip('.,?!:;()[]{}') for word in query.lower().split() if len(word.strip('.,?!:;()[]{}')) > 2}
        docs=[x for x in self.documents if not category or x['category']==category]
        matches=[]
        for document in docs:
            paragraphs=[paragraph.strip() for paragraph in document['content'].split('\n\n') if paragraph.strip()]
            for paragraph in paragraphs:
                score=sum(word in paragraph.lower() for word in words)
                if score:
                    matches.append((score, paragraph, document['source']))
        matches.sort(key=lambda item:item[0], reverse=True)
        return [{'content':paragraph[:650],'source':source} for _, paragraph, source in matches[:top_k]]
