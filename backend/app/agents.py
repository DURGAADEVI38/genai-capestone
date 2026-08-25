import os
from typing import TypedDict
from langgraph.graph import END, START, StateGraph
from app.rag import RAGSystem
from app.services import create_support_ticket

class AgentState(TypedDict):
    employee_id: int
    query: str
    history: list[dict]
    agent_type: str
    response: str
    sources: list[str]
    db: object
    ticket_number: str

def _is_ticket_request(query: str) -> bool:
    normalized = query.lower()
    return any(term in normalized for term in (
        'create a ticket', 'create ticket', 'open a ticket', 'raise a ticket',
        'submit a ticket', 'log a ticket', 'support ticket', 'not working',
        'cannot', "can't", 'unable', 'failed', 'failure', 'still broken',
        'not connecting', 'keeps failing', 'unresolved',
    ))

class AgentRouter:
    def __init__(self, rag: RAGSystem):
        self.rag = rag
        self.graph = self._build_graph()

    @staticmethod
    def route(query: str) -> str:
        normalized = query.lower()
        if any(term in normalized for term in ('vpn', 'laptop', 'software', 'password', 'network', 'access', 'computer', 'ticket')):
            return 'it_agent'
        if any(term in normalized for term in ('course', 'training', 'skill', 'learn', 'career')):
            return 'training_agent'
        return 'hr_agent'

    def _router_node(self, state: AgentState):
        return {'agent_type': self.route(state['query'])}

    def _it_node(self, state: AgentState):
        return {'agent_type': 'ticket_agent' if _is_ticket_request(state['query']) else 'it_agent'}

    def _ticket_node(self, state: AgentState):
        query = state['query']
        normalized = query.lower()
        category = 'vpn' if 'vpn' in normalized else 'technical_support'
        priority = 'high' if any(term in normalized for term in ('failed', 'cannot', "can't", 'not working', 'unresolved')) else 'medium'
        title = 'VPN access issue' if 'vpn' in normalized else 'Laptop support request' if 'laptop' in normalized else 'IT support request'
        ticket = create_support_ticket(state['db'], state['employee_id'], title, query, category, priority)
        return {'agent_type': 'ticket_agent', 'ticket_number': ticket.ticket_number, 'response': f'I created support ticket {ticket.ticket_number} for the IT team. They will follow up on this {category} issue.'}

    async def _answer_node(self, state: AgentState):
        category = {'hr_agent': 'hr', 'it_agent': 'it', 'training_agent': 'training'}[state['agent_type']]
        hits = self.rag.search(state['query'], category)
        context = '\n\n'.join(f'- {item["content"]}' for item in hits[:3])
        if not os.getenv('OPENAI_API_KEY'):
            response = 'AI service is not configured. Please set OPENAI_API_KEY before using chat.'
        else:
            from langchain_openai import ChatOpenAI
            llm = ChatOpenAI(model=os.getenv('OPENAI_MODEL', 'gpt-4o-mini'), temperature=0)
            prompt = f'''You are the {state["agent_type"]} for TechNova Solutions.
Answer the employee's question directly and conversationally.
Rules:
- Answer only what was asked.
- Give the direct answer first, followed by no more than three useful details when needed.
- Use the context only when it is relevant to the question. If it is unrelated or insufficient, do not force it into the answer.
- Do not reproduce or summarize the full source document.
- When context supports the answer, end with exactly: Source: <filename>.
- Do not invent policies, contacts, or procedures.

Relevant context:
{context or "No relevant company context was retrieved."}

Employee question: {state["query"]}'''
            try:
                response = (await llm.ainvoke(prompt)).content.strip()
            except Exception as exc:
                message = str(exc).lower()
                response = 'The AI provider quota is exhausted. Please check the OpenAI project billing and API key.' if 'quota' in message or '429' in message else 'The AI provider is temporarily unavailable. Please try again shortly.'
        return {'response': response, 'sources': [item['source'] for item in hits]}

    def _build_graph(self):
        workflow = StateGraph(AgentState)
        workflow.add_node('router', self._router_node)
        workflow.add_node('it_agent', self._it_node)
        workflow.add_node('ticket_agent', self._ticket_node)
        workflow.add_node('answer_agent', self._answer_node)
        workflow.add_edge(START, 'router')
        workflow.add_conditional_edges('router', lambda state: state['agent_type'], {'it_agent': 'it_agent', 'hr_agent': 'answer_agent', 'training_agent': 'answer_agent'})
        workflow.add_conditional_edges('it_agent', lambda state: state['agent_type'], {'ticket_agent': 'ticket_agent', 'it_agent': 'answer_agent'})
        workflow.add_edge('ticket_agent', END)
        workflow.add_edge('answer_agent', END)
        return workflow.compile()

    async def answer(self, state: AgentState):
        return await self.graph.ainvoke(state)
