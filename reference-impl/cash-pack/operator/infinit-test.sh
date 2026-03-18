export BASE_URL=http://localhost:3000

# for ((i=$1; i>=0; i--)); do
#     echo "Running test $i of $1..."
#     npx ts-node test/e2e.ts    
# done


npx ts-node test/e2e.ts
./infinit-test.sh 