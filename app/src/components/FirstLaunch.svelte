<script lang="ts">
    import axios from "axios";
    import { API_BASE_URL, APP_NAME, IS_MOBILE, USERCONTENT_BASE_URL } from "../utils/constants";
    import { decodeToken } from "../utils/user";

    let isLoaded = false;
    let error = null;
    let step = 1;
    let user = decodeToken();
    let data = {
        interests: [],
    }
    let validForm = true;

    const interests = [];

    (async () => {
        const response = await axios.get(`${API_BASE_URL}/interests/all`);
        if (response.status === 200) {
            response.data.interests.forEach((interest: any) => {
                interests.push(interest);
            });
        } else {
            console.error(response);
            error = `
                Une erreur inconnue est survenue lors de la connexion aux serveurs de ${APP_NAME}. Veuillez réessayer plus tard<br>
                Si le problème persiste, <a class="link" href="/support">contactez le support</a>.
            `;
        }
        isLoaded = true;
    })();

    function validateForm() {
        if (
            (document.getElementById("name") as HTMLInputElement).value.length < 3 ||
            (document.getElementById("name") as HTMLInputElement).value.length > 20
        ) {
            validForm = false;
        } else {
            validForm = true;
        }
    }
</script>

<div id="firstLaunchModal" class="bg-black bg-opacity-50 absolute top-0 left-0 w-full h-screen z-50">
    <div class="modal-container absolute bg-base-100 rounded-lg shadow-lg p-10 w-11/12 lg:w-7/12 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col justify-between">
        {#if isLoaded}
            {#if error}
                <div class="flex flex-col items-center justify-center h-full">
                    <h1 class="text-4xl font-bold text-center my-3">
                        Erreur
                    </h1>
                    <p class="text-center text-xl my-3">
                        {@html error}
                    </p>
                </div>
            {:else}
                {#if step === 1}
                    <div class="shrink-0">
                        <span class="text-lg">
                            Étape 1/2
                        </span>
                        <h1 class="text-2xl sm:text-4xl font-bold text-center">
                            Vous êtes prêts à découvrir {APP_NAME}
                        </h1>
                        <p class="text-center text-lg sm:text-xl">
                            Sélectionnez quelques centres d'intérêts avant de commencer à rejoindre la communauté de {APP_NAME}.
                        </p>
                    </div>
                    <div
                        id="interests"
                        class="grid grid-cols-4 max-xl:grid-cols-3 max-md:grid-cols-2 gap-4 mt-10 overflow-y-scroll relative p-0 sm:p-5"
                    >
                        {#each interests as interest}
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <div
                                data-interest={interest.name}
                                class="
                                    flex flex-col items-center justify-center shadow-lg rounded-lg p-2 cursor-pointer bg-base-100 border border-base-300 transition duration-200 ease-in-out transform hover:-translate-y-1 hover:scale-110
                                "
                                on:click={() => {
                                    if (data.interests.includes(interest.name))
                                        data.interests.splice(data.interests.indexOf(interest.name), 1);
                                    else
                                        data.interests.push(interest.name);
                                    document.querySelector(`[data-interest="${interest.name}"]`).classList.toggle("bg-base-200");
                                    document.querySelector(`[data-interest="${interest.name}"]`).classList.toggle("border-primary");
                                }}
                            >
                                <div class="bg-base-300 rounded-full p-5 w-20 h-20 flex items-center justify-center">
                                    <i class="{interest.icon + " text-3xl"}"></i>
                                </div>
                                <p class="text-center mt-3">
                                    {interest.name}
                                </p>
                            </div>
                        {/each}
                    </div>
                    <div class="flex justify-end mt-4 sm:mt-10">
                        <button
                            class="btn btn-primary btn-wide"
                            on:click={() => {
                                axios.post(`${API_BASE_URL}/profile/interests`, {
                                    action: 'add',
                                    interests: data.interests,
                                }, {
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                                    }
                                });

                                step++;
                            }}
                        >
                            Continuer
                        </button>
                    </div>
                {:else if step === 2}
                    <div class="shrink-0">
                        <span class="text-lg">
                            Étape 2/2
                        </span>
                        <h1 class="text-2xl sm:text-4xl font-bold text-center">
                            Complétez votre profil
                        </h1>
                        <p class="text-center text-lg sm:text-xl">
                            Ajoutez un nom, une photo de profil et une description pour que les autres utilisateurs puissent vous découvrir.
                        </p>
                    </div>
                    <div class="card w-fit sm:w-96 shadow-xl bg-base-200 py-2 sm:py-10 mt-4 mx-auto">
                        <div class="card-body flex flex-col items-center">
                            <div class="relative">
                                <div class="group w-32 h-32 rounded-full overflow-hidden">
                                    <!-- svelte-ignore a11y-img-redundant-alt -->
                                    <img
                                        src="{USERCONTENT_BASE_URL}/avatar/{user.avatar}"
                                        alt="Photo de profil"
                                        class="w-32 h-32"
                                    />
                                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                                    <div
                                        class="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-{IS_MOBILE() ? 50 : 0} group-hover:opacity-100 group-active:opacity-100 transition duration-200 ease-in-out cursor-pointer"
                                        on:click={() => {
                                            // @ts-ignore
                                            document.querySelector("#profile-picture").click();
                                        }}
                                    >
                                        <i class="fas fa-camera text-3xl text-white"></i>
                                    </div>
                                    <input
                                        type="file"
                                        id="profile-picture"
                                        class="hidden"
                                        accept="image/*"
                                        on:change={() => {
                                            // @ts-ignore
                                            const files = document.querySelector("#profile-picture").files;
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                // @ts-ignore
                                                document.querySelector(".card-body img").src = reader.result;
                                            };
                                            reader.readAsDataURL(files[0]);

                                            let formData = new FormData();
                                            formData.append("files", files[0]);
                                            axios.post(`${API_BASE_URL}/profile/picture`, formData, {
                                                headers: {
                                                    'Content-Type': 'multipart/form-data',
                                                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                                                }
                                            });
                                        }}
                                    />
                                </div>
                            </div>
                            <div class="form-control">
                                <label class="label" for="name">
                                    <span class="text-sm text-error {validForm ? 'opacity-0' : 'opacity-100'}">
                                        Le nom doit contenir entre 3 et 20 caractères
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Nom"
                                    value={user.displayName}
                                    id="name"
                                    class="input input-bordered {validForm ? '' : 'input-error'} w-full max-w-md"
                                    on:keyup={validateForm}
                                    on:change={validateForm}
                                />
                                <label class="label" for="name">
                                    <span class="text-md">
                                        @{user.username}
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-end mt-4 sm:mt-10">
                        <button
                            class="btn btn-primary btn-wide"
                            disabled={!validForm}
                            on:click={() => {
                                axios.post(`${API_BASE_URL}/profile/displayName`, {
                                    // @ts-ignore
                                    displayName: document.getElementById("name").value,
                                }, {
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                                    }
                                });

                                axios.post(`${API_BASE_URL}/profile/firstLaunch`, {}, {
                                    headers: {
                                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                                    }
                                });

                                document.getElementById('firstLaunchModal').remove();
                            }}
                        >
                            Continuer
                        </button>
                    </div>
                {/if}
            {/if}
        {:else}
            <div class="flex flex-col items-center justify-center h-full animate-pulse">
                <i class="fas fa-spinner-third fa-spin text-5xl mb-5"></i>
                <h2 class="text-center text-xl">
                    Chargement...
                </h2>
            </div>
        {/if}
    </div>
</div>

<style>
    .modal-container {
        height: 80%;
    }

    @media screen and (max-width: 640px) {
        .modal-container {
            height: 92%;
        }
    }
</style>
