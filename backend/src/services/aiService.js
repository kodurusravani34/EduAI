const axios = require('axios');

class AIService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.apiUrl = process.env.OPENROUTER_API_URL;
    this.model = 'anthropic/claude-3-haiku';
  }

  async generateStudyPlan(userProfile, goals) {
    try {
      const prompt = `
        Create a personalized study plan for a user with the following profile:
        - Skill Level: ${userProfile.skillLevel}
        - Learning Preferences: ${userProfile.learningPreferences.join(', ')}
        - Daily Goal: ${userProfile.preferences.dailyGoal} minutes
        
        Goals:
        ${goals.map(goal => `- ${goal.title} (${goal.category}, ${goal.difficulty})`).join('\n')}
        
        Please provide:
        1. Weekly study schedule
        2. Recommended learning sequence
        3. Time allocation for each goal
        4. Suggested milestones
        
        Format the response as JSON with structured recommendations.
      `;

      const response = await this.makeAPICall(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating study plan:', error);
      throw new Error('Failed to generate study plan');
    }
  }

  async recommendNextLessons(completedLessons, currentGoals, userPreferences) {
    try {
      const prompt = `
        Based on the user's completed lessons and current goals, recommend the next 5 lessons:
        
        Completed Lessons: ${completedLessons.map(l => l.title).join(', ')}
        Current Goals: ${currentGoals.map(g => g.title).join(', ')}
        Learning Preferences: ${userPreferences.learningPreferences.join(', ')}
        
        Provide recommendations with:
        - Lesson title
        - Learning objective
        - Estimated duration
        - Difficulty level
        - Why it's recommended
        
        Format as JSON array.
      `;

      const response = await this.makeAPICall(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error getting lesson recommendations:', error);
      throw new Error('Failed to get recommendations');
    }
  }

  async analyzeLearningProgress(userStats, recentLessons) {
    try {
      const prompt = `
        Analyze the user's learning progress and provide insights:
        
        Stats:
        - Total lessons completed: ${userStats.totalLessonsCompleted}
        - Total time spent: ${userStats.totalTimeSpent} minutes
        - Current streak: ${userStats.currentStreak} days
        - Goals achieved: ${userStats.totalGoalsAchieved}
        
        Recent Lessons: ${recentLessons.map(l => `${l.title} (${l.progress.timeSpent}min)`).join(', ')}
        
        Provide:
        1. Progress summary
        2. Strengths identified
        3. Areas for improvement
        4. Motivation tips
        5. Adjusted recommendations
        
        Format as JSON with structured insights.
      `;

      const response = await this.makeAPICall(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error analyzing progress:', error);
      throw new Error('Failed to analyze progress');
    }
  }

  async suggestGoalMilestones(goalTitle, goalDescription, category, difficulty) {
    try {
      const prompt = `
        Create milestone suggestions for this learning goal:
        
        Title: ${goalTitle}
        Description: ${goalDescription}
        Category: ${category}
        Difficulty: ${difficulty}
        
        Create 5-8 progressive milestones that break down this goal into achievable steps.
        Each milestone should have:
        - Title
        - Description
        - Estimated time to complete
        - Prerequisites
        - Success criteria
        
        Format as JSON array.
      `;

      const response = await this.makeAPICall(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error suggesting milestones:', error);
      throw new Error('Failed to suggest milestones');
    }
  }

  async makeAPICall(prompt, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await axios.post(this.apiUrl, {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are an AI education assistant that provides structured, helpful responses in JSON format when requested. Always ensure your JSON responses are valid and well-formatted.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        }, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://eduai-app.com',
            'X-Title': 'EduAI Study Planner'
          }
        });

        return response.data.choices[0].message.content;
      } catch (error) {
        console.error(`AI API call attempt ${attempt} failed:`, error.message);
        if (attempt === maxRetries) {
          throw error;
        }
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
}

module.exports = new AIService();
