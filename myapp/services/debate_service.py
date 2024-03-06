from datetime import datetime
from BossAgent import BossAgent

class DebateService:
    def __init__(self, db, uid, chat_id, user_service, message_service, role1, role2, num_rounds=3):
        self.db = db
        self.uid = uid
        self.user_service = user_service
        self.message_service = message_service
        self.chat_id = chat_id
        self.role1 = role1
        self.role2 = role2
        self.num_rounds = num_rounds
        self.response_content = None
        
        # Initialize two agents
        self.agent1 = BossAgent(self.uid, self.user_service, self.chat_id,  system_prompt=self.role1)
        self.agent2 = BossAgent(self.uid, self.user_service, self.chat_id, system_prompt=self.role2)

    @staticmethod
    def create_debate(db, uid):
        """
        Creates a new debate in the database and returns the id of the debate
        Returning the ID allows me to create a component in the UI for the debate.
        When that component mounts it will start the debate by calling the start_debate endpoint.
        """

        new_chat = {
            'chat_name': 'Debate',
            'agent_model': 'AgentDebate',
            'created_at': datetime.utcnow(),
            'is_open': True,
        }
        new_chat_ref = db.collection('users').document(uid).collection('conversations').add(new_chat)
        new_chat_id = new_chat_ref[1].id

        return  new_chat_id
    
    def run_debate(self, topic, turn):
        message_service = self.message_service
        agent_responding = None
        if turn == 0:
            opening_argument_content = self.agent1.pass_to_debateAI({'content': f"You are in a debate and have been chosen to go first. The topic to be debated is: {topic}. Please make your opening argument."})
            self.response_content = opening_argument_content
            agent_responding = 'agent1'
        else:
            if turn % 2 == 0:  # Even round
                self.response_content = self.agent1.pass_to_debateAI({'content': self.response_content})
                agent_responding = 'agent1'
            else:  # Odd round
                self.response_content = self.agent2.pass_to_debateAI({'content': f"You are in a debate, based on the role you were given respond to your opponents message: {self.response_content}" })
                agent_responding = 'agent2'

        # Create a new message for each response
        message_service.create_message(conversation_id=self.chat_id, user_id=self.uid, message_content=self.response_content, message_from=agent_responding)

        return self.response_content, turn < self.num_rounds, agent_responding
