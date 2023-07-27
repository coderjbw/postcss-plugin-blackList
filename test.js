const str = '/Users/jubowen/Desktop/website/website/src/components-mobile/TopBar/components/MenuDrawer.vue';

console.log(str.indexOf('/components/MenuDrawer'));
const arr = [1,5,5,5,6];
const black = [5];
function conarr(arr) {
    for(let i =0; i<arr.length;i++) {
        black.forEach(item => {
            if(item === arr[i]) {
                return 
            }
        })
        console.log(arr[i]);
    }
    arr.forEach(element => {
        
    });
}

conarr(arr)