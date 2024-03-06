class ProfileService:
    
    @staticmethod
    def update_profile_questions(uid, data, db):
        """
        Add profile data to the users collection
        """
        doc_ref = db.collection('users').document(uid)
        profile_ref = doc_ref.collection('profile').document('questions')
        profile_ref.set(data)

        return {'message': 'User profile updated'}, 200
    
    @staticmethod
    def load_profile_questions(uid, db):
        """
        Get profile data from the users collection
        """
        
        doc_ref = db.collection('users').document(uid)
        profile_ref = doc_ref.collection('profile').document('questions')
        profile = profile_ref.get()
        
        return profile.to_dict()
    
