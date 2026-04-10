from crewai import Agent, Task, Crew, Process, LLM
from crewai_tools import FileReadTool, DirectoryReadTool
import os
from dotenv import load_dotenv

load_dotenv()

# Configure LLM
llm = LLM(
    model="deepseek/deepseek-chat",
    api_key=os.getenv("DEEPSEEK_API_KEY")
)

# Initialize tools
file_reader = FileReadTool()
directory_reader = DirectoryReadTool()

# =======================
# AGENTS
# =======================

test_architect = Agent(
    role='Test Architect',
    goal='Map app flows to source code and identify missing implementations',
    backstory='''You are a senior QA architect specializing in React Native and Supabase. 
    Your expertise is in technical auditing of mobile app flows by examining source code.''',
    verbose=True,
    llm=llm,
    tools=[file_reader, directory_reader],
    allow_delegation=False
)

flow_analyst = Agent(
    role='App Flow Analyst',
    goal='Analyze individual app flows for logical correctness and technical completeness',
    backstory='''You are a meticulous mobile flow analyst. You check navigation stacks, 
    API integrations (Supabase), and state management to ensure user journeys are coherent 
    and technically sound.''',
    verbose=True,
    llm=llm,
    tools=[file_reader],
    allow_delegation=False
)

# =======================
# TASKS
# =======================

mapping_task = Task(
    description='''
    Examine the codebase and map the following flows to their respective React Native screens and components:
    1. Landing page to auth login (Login/Signup)
    2. Social login (Google/Apple) integration
    3. Dating mode tabs: Home, Discovery (Tribes), Feature (Impress), Chat, Profile
    4. Realtime chat logic (subscriptions/messages)
    5. Social interactions: Likes and Impress post interactions (likes/comments)
    6. Dating request handling
    7. Tribes/Zones filter implementation
    8. Profile settings, updates, and Password reset
    9. Account verification (Selfie/Video)
    10. Matches swiping functionality
    
    Output: A mapping document linking each feature to specific files.
    ''',
    agent=test_architect,
    expected_output='A detailed mapping of features to source files.'
)

flow_verification_task = Task(
    description='''
    Based on the mapping, analyze each flow for implementation completeness.
    For each flow, verify:
    - Navigation: Is the screen reachable and does it lead where it should?
    - Supabase: Are database calls and auth calls implemented for this feature?
    - Real-time: For Chat and Social interactions, is real-time functionality present?
    - Logic: Are there obvious bugs or missing edge case handlers in the code?
    
    Flows to analyze:
    - Auth & Social Login
    - Dating Experience (Swiping, Tribes, Impress)
    - Social Features (Realtime Chat, Likes, Comments)
    - Profile Management (Updates, Verification, Password Reset)
    ''',
    agent=flow_analyst,
    expected_output='A comprehensive flow analysis report with status for each feature.',
    context=[mapping_task]
)

# =======================
# CREW
# =======================

crew = Crew(
    agents=[test_architect, flow_analyst],
    tasks=[mapping_task, flow_verification_task],
    process=Process.sequential,
    verbose=True
)

if __name__ == "__main__":
    print("🚀 Running CrewAI App Flow Test...")
    result = crew.kickoff()
    
    print("\n--- Task Outputs ---")
    for i, task in enumerate(crew.tasks):
        print(f"\nTask {i+1} Output:")
        print(task.output.raw if task.output else "No output")

    # Save the report
    report_path = "crewai-automation/flow_analysis_report.md"
    with open(report_path, "w") as f:
        f.write("# CrewAI App Flow Analysis Report\n\n")
        f.write(str(result))
        
    print(f"\n✅ Analysis complete. Report saved to {report_path}")
