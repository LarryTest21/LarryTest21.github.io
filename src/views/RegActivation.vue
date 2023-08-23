<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useRoute } from "vue-router";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import db from "../firebase/firebaseInit";
import Modal from "@/components/Modal.vue"
import router from "@/router";

const route = useRoute();
const modalFirstLoad = ref(false)
const modalAnimation = ref(false)

const activationToken = ref(route.params.activationToken) as any;
const modalLoadingMessage = ref('Checking activation')

onMounted(async () => {
    setTimeout(() => {
        modalFirstLoad.value = true
    }, 200);
    modalAnimation.value = true
    const q = query(collection(db, "users"), where("activationToken", "==", activationToken.value));
    const querySnapshot = await getDocs(q);

    setTimeout(() => {
        if (querySnapshot.empty) {
            modalAnimation.value = false
            modalLoadingMessage.value = 'No users to activate'
        } else {

        }
        querySnapshot.forEach(async (docu) => {
            const activated = docu.data()['activated']

            if (!activated) {
                const doc2 = doc(db, "users", docu.id);
                console.log(activated);
                await updateDoc(doc2, {
                    activated: true
                });
                modalAnimation.value = false

                modalLoadingMessage.value = 'Succesfully activated'
                setTimeout(() => {
                    router.push({ name: "landing" });

                }, 3000);

            } else {
                modalAnimation.value = false
                modalLoadingMessage.value = 'Already activated'
            }


        })
    }, 1000);


})

</script>

<template>
    <div class="wrapper">
        <div class="inner">
            <transition name="modal">
                <Modal v-if="modalFirstLoad" :modalAnimation="modalAnimation" :modalLoadingMessage="modalLoadingMessage"
                    :spinnerColor="'var(--color-nav-txt)'" :fontSize="'2rem'" :position="'absolute'" class="modal"
                    :backgroundOpacity="1" />
            </transition>

        </div>
    </div>
</template>

<style lang="scss" scoped>
.wrapper {
    position: relative;
    height: 100vh;
    width: 100vw;

    .inner {
        position: relative;
        height: calc(100% - 70px);
        top: 70px;
        display: flex;
        justify-content: center;
        align-items: center;

        .modal {
            position: relative;
            height: 400px;
            width: 600px;
            border-radius: 30px;
            overflow: hidden;
            box-shadow: 2px 2px 5px 2px rgba(0, 0, 0, 0.3);
        }
    }
}

.modal-enter-active,
.modal-leave-active {
    transition: all 0.5s ease-in-out;
    opacity: 1;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
    transform: translateY(-200px)
}
</style>