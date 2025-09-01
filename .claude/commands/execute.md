# /execute

Executes an approved plan from the tasks directory.

## Usage
```
/execute [task-number]
```

## Arguments
- `task-number` (optional): The task number to execute (e.g., 0001, 0002). If not provided, will execute the most recent task.

## Behavior
1. **Locate Plan File**
   • Find the specified task file in the `tasks/` directory
   • If no task number provided, use the highest numbered task file
   • Verify the plan file exists and is readable
   
2. **Review Plan**
   • Read and understand the plan requirements
   • Confirm the plan has been approved (not in draft state)
   • Identify key implementation steps
   • Append plan with a implementation checklist

3. **Execute Implementation**
   • Follow the plan step by step
   • Implement code changes as outlined
   • Create necessary files and modifications
   • Run tests if specified in the plan

4. **Verify Results**
   • Execute any tests related to the changes
   - Run all tests to make sure nothing broke
   • Confirm implementation meets plan requirements


## Examples
```bash
/execute 0003          # Execute task 0003
/execute               # Execute the most recent task
```

## Notes
- Only execute plans that have been explicitly approved
- Stop execution if any critical errors occur
- Follow existing code patterns and conventions